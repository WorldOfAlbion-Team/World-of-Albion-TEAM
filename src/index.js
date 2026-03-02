import express from "express";
import "dotenv/config";
import { Client, GatewayIntentBits, Collection, Partials, Events } from "discord.js";
import { BOT_NAME } from "./config.js";
import { initDatabase } from "./database.js";
import { loadCommands } from "./handlers/commandHandler.js";
import { loadEvents } from "./handlers/eventHandler.js";
import { logger } from "./utils/logger.js";

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) throw new Error("❌ Falta DISCORD_TOKEN en las variables de entorno");

const app = express();
const PORT = process.env.PORT || 10000;

// Health-check inmediato para Render
app.get("/", (_, res) => res.status(200).send("✅ World Of Albion BOT ONLINE"));
app.get("/health", (_, res) => res.status(200).json({ status: "ok" }));

app.listen(PORT, () => logger.info(`🌐 Web server activo en puerto ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages, // Necesario para recibir MDs de soporte
    GatewayIntentBits.MessageContent, // Necesario para leer el contenido de los MDs
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel, Partials.Message] // Requerido para MDs con usuarios nuevos
});

client.commands = new Collection();

// Usamos Events.ClientReady que es la forma recomendada en discord.js v14
client.once(Events.ClientReady, async (c) => {
  try {
    logger.info(`🤖 Conectado como ${client.user.tag}`);
    
    // Intentar inicializar base de datos (opcional para modo de prueba local)
    try {
      await initDatabase();
    } catch (dbError) {
      logger.warn("⚠️  Base de datos no disponible - funcionando en modo de prueba sin persistencia");
    }
    
    await loadCommands(client);
    await loadEvents(client);
    logger.info("🚀 Bot totalmente inicializado y operativo");
  } catch (err) {
    logger.error("❌ Error durante la inicialización:");
    console.error(err);
    process.exit(1);
  }
});

// Prevenir crashes por errores no capturados
process.on('unhandledRejection', (error) => {
  logger.error('❌ unhandledRejection:', error);
});

process.on('uncaughtException', (error) => {
  logger.error('❌ uncaughtException:', error);
});

client.login(TOKEN);