import { Client, GatewayIntentBits, Collection } from "discord.js";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { loadEvents } from "./handlers/eventHandler.js";
import { loadCommands } from "./handlers/commandHandler.js";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { allowedGuilds } from "./config/whitelist.js";
import pg from "pg";

// -----------------------------
//  PostgreSQL (Pool)
// -----------------------------
const { Pool } = pg;

export const db = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
    ssl: { rejectUnauthorized: false }
});

// -----------------------------
//  Iniciar DB y crear tabla
// -----------------------------
async function initDatabase() {
    try {
        await db.connect();
        console.log("🟢 PostgreSQL conectado correctamente.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS guild_configs (
                guild_id TEXT NOT NULL,
                tipo TEXT NOT NULL,
                canal_embed TEXT,
                categoria_voz TEXT,
                updated_at TIMESTAMP DEFAULT NOW(),
                PRIMARY KEY (guild_id, tipo)
            );
        `);

        console.log("📁 Tabla guild_configs lista.");
    } catch (err) {
        console.error("🔴 Error inicializando PostgreSQL:", err);
    }
}

// -----------------------------
//  Sistema existente JSON (compatibilidad)
// -----------------------------
const CONFIG_DIR = join(process.cwd(), "guild_configs");
if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR);

global.guildConfigs = {};
console.log("📁 Configuraciones locales cargadas desde JSON");


// -----------------------------
//  Discord Client
// -----------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();


// -----------------------------
//  Errores globales
// -----------------------------
process.on("unhandledRejection", reason => {
    console.error("💥 Unhandled Rejection:", reason);
});

process.on("uncaughtException", err => {
    console.error("💥 Uncaught Exception:", err);
});


// -----------------------------
//  Inicialización del bot
// -----------------------------
(async () => {
    await initDatabase();

    try {
        console.log("📦 Cargando comandos...");
        await loadCommands(client);

        console.log("🎧 Cargando eventos...");
        await loadEvents(client);

        console.log("🔑 Conectando a Discord...");
        await client.login(config.token);

        console.log("✅ Bot iniciado correctamente.");
    } catch (err) {
        console.error("❌ Error iniciando el bot:", err);
    }
})();


// -----------------------------
//  WHITELIST (bloqueo total)
// -----------------------------
client.on("interactionCreate", async interaction => {
    const guild = interaction.guild;
    if (!guild) return;

    if (!allowedGuilds.includes(guild.id)) {
        if (interaction.reply) {
            return interaction.reply({
                content: "❌ Este servidor no está autorizado para usar el bot.",
                ephemeral: true
            }).catch(() => {});
        }
        return;
    }
});
