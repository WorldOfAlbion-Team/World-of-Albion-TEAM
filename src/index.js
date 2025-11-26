import { Client, GatewayIntentBits, Collection } from "discord.js";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { loadEvents } from "./handlers/eventHandler.js";
import { loadCommands } from "./handlers/commandHandler.js";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { allowedGuilds } from "./config/whitelist.js";

// -----------------------------
//  PostgreSQL CONNECTION
// -----------------------------
import pg from "pg";
const { Pool } = pg;

export const db = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
    ssl: { rejectUnauthorized: false }
});

// Test de conexión
db.connect()
    .then(() => console.log("🟢 PostgreSQL conectado correctamente."))
    .catch(err => console.error("🔴 Error conectando PostgreSQL:", err));

// Crear tabla si no existe
await db.query(`
    CREATE TABLE IF NOT EXISTS guild_configs (
        guild_id TEXT PRIMARY KEY,
        channel_group TEXT,
        channel_gold TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
    );
`).catch(err => console.error("❌ Error creando tabla:", err));


// -----------------------------
//  SISTEMA EXISTENTE DE JSON
// -----------------------------
const CONFIG_DIR = join(process.cwd(), "guild_configs");
if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR);

global.guildConfigs = {};
console.log("📁 Configuraciones por servidor cargadas desde JSON");


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
//  PROCESOS GLOBALES
// -----------------------------
process.on("unhandledRejection", reason => {
    console.error("💥 Unhandled Rejection:", reason);
});

process.on("uncaughtException", err => {
    console.error("💥 Uncaught Exception:", err);
});


// -----------------------------
//  INICIALIZACIÓN DEL BOT
// -----------------------------
(async () => {
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
