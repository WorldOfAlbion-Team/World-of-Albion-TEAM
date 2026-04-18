import { REST, Routes } from "discord.js";
import { readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("❌ Faltan variables (DISCORD_TOKEN, CLIENT_ID, GUILD_ID)");
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
          const json = mod.default.data.toJSON();

          // 🔥 evita duplicados
          if (!commands.find(c => c.name === json.name)) {
            commands.push(json);
            console.log(`✔ ${json.name}`);
          } else {
            console.log(`⚠️ duplicado ignorado: ${json.name}`);
          }
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

    // 🧨 LIMPIEZA GLOBAL (esto era lo que te faltaba)
    console.log("🧨 Eliminando comandos GLOBAL...");
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: [] }
    );

    // 🧹 LIMPIEZA GUILD
    console.log("🧹 Limpiando comandos del servidor...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] }
    );

    // 🚀 REGISTRO FINAL
    console.log(`🚀 Registrando ${commands.length} comandos...`);
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Sistema limpio y sincronizado");
    console.log("💡 Escribe / en Discord ahora");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

deploy();
