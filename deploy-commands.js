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
          commands.push(mod.default.data.toJSON());
          console.log(`✔ ${mod.default.data.name}`);
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

    // 🧹 Limpieza TOTAL del servidor
    console.log("🧹 Limpiando comandos del servidor...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] }
    );

    // 🚀 Registro INSTANTÁNEO en el servidor
    console.log(`🚀 Registrando ${commands.length} comandos en el servidor...`);
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Comandos actualizados INSTANTÁNEAMENTE");
    console.log("💡 Escribe / en Discord ahora mismo");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

deploy();
