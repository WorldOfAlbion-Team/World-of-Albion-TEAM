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

// Health-check para Render
app.get("/", (_, res) => res.status(200).send("✅ World Of Albion BOT ONLINE"));
app.get("/health", (_, res) => res.status(200).json({ status: "ok" }));

app.listen(PORT, () => logger.info(`🌐 Web server activo en puerto ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.commands = new Collection();

client.once(Events.ClientReady, async () => {
  try {
    logger.info(`🤖 Conectado como ${client.user.tag}`);
    
    // Base de datos
    try {
      await initDatabase();
      logger.info("✅ PostgreSQL inicializado");
    } catch (dbError) {
      logger.warn("⚠️ Base de datos no disponible - modo prueba");
    }

    // Cargar comandos y eventos (SOLO carga, NO registra)
    await loadCommands(client);
    await loadEvents(client);

    logger.info("🚀 Bot totalmente inicializado y operativo");

  } catch (err) {
    logger.error("❌ Error durante la inicialización:");
    console.error(err);
    process.exit(1);
  }
});

// Manejo de errores globales
process.on("unhandledRejection", (error) => {
  logger.error("❌ unhandledRejection:", error);
});

process.on("uncaughtException", (error) => {
  logger.error("❌ uncaughtException:", error);
});

client.login(TOKEN);
