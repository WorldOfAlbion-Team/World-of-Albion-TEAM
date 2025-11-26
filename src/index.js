import { Client, GatewayIntentBits, Collection } from "discord.js";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { loadEvents } from "./handlers/eventHandler.js";
import { loadCommands } from "./handlers/commandHandler.js";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { allowedGuilds } from "./config/whitelist.js"; // ✅ Importar whitelist

// Crear carpeta de configuraciones si no existe
const CONFIG_DIR = join(process.cwd(), "guild_configs");
if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR);

// Errores globales
process.on("unhandledRejection", (reason) => {
    console.error("💥 Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("💥 Uncaught Exception:", err);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// ✅ Cargar configuraciones previas (auto-carga)
global.guildConfigs = {}; // por compatibilidad si usas memoria
console.log("📁 Configuraciones por servidor cargadas desde JSON");

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
        console.error("❌ Error iniciando el bot:");
        console.error(err);
        console.error(err?.stack);
    }
})();

// ✅ BLOQUEO TOTAL - antes que cualquier handler
client.on("interactionCreate", async interaction => {
    const guild = interaction.guild;
    if (!guild) return; // DM o canal parcial

    if (!allowedGuilds.includes(guild.id)) {
        // Silencioso para el usuario, visible solo para él
        if (interaction.isRepliable()) {
            return interaction.reply({
                content: "❌ Este servidor no está autorizado para usar el bot.",
                flags: [64] // ephemeral
            }).catch(() => {});
        }
        return; // ➜ no continúa NADA más
    }

    // ➜ Si está autorizado, continúa con handlers posteriores
});