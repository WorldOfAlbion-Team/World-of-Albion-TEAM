import { REST, Routes } from "discord.js";
import { readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env; // Agregué GUILD_ID para la limpieza

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error("❌ ERROR: Faltan variables (DISCORD_TOKEN o CLIENT_ID)");
  process.exit(1);
}

const commands = [];
const commandsPath = path.resolve("./src/commands");

async function loadCommands(folderPath) {
  const items = readdirSync(folderPath);
  for (const item of items) {
    const fullPath = path.join(folderPath, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      await loadCommands(fullPath);
    } else if (item.endsWith(".js")) {
      const fileUrl = pathToFileURL(fullPath).href;
      try {
        const mod = await import(fileUrl);
        if (mod.default?.data) {
          commands.push(mod.default.data.toJSON());
          console.log(`✔ Cargado: ${mod.default.data.name}`);
        }
      } catch (err) {
        console.error(`❌ Error en ${item}:`, err);
      }
    }
  }
}

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

async function deploy() {
  try {
    console.log("📥 Cargando comandos...");
    await loadCommands(commandsPath);

    // --- PASO 1: LIMPIEZA DE DUPLICADOS ---
    if (GUILD_ID) {
        console.log("🧹 Borrando comandos antiguos del servidor de pruebas...");
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
    }

    // --- PASO 2: DESPLIEGUE GLOBAL ---
    console.log(`🚀 Desplegando ${commands.length} comandos GLOBALMENTE...`);
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ ¡ÉXITO! Solo deberías ver 1 versión de cada comando ahora.");
    console.log("💡 Si aún ves dos, reinicia tu Discord (CTRL + R).");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

deploy();