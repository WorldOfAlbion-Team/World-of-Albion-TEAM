import { REST, Routes } from "discord.js";
import { readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

dotenv.config();

// __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Variables necesarias
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!TOKEN || !CLIENT_ID) {
    console.error("❌ ERROR: Falta TOKEN o CLIENT_ID en .env");
    process.exit(1);
}

const commands = [];

// 🔥 RUTA ABSOLUTA 100% SEGURA
const commandsPath = path.resolve("./src/commands");

// Cargar comandos recursivamente
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
                    console.log(`✔ Comando cargado: ${mod.default.data.name}`);
                } else {
                    console.warn(`⚠ Archivo sin comando válido: ${item}`);
                }
            } catch (err) {
                console.error(`❌ Error cargando comando ${item}:`, err);
            }
        }
    }
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function deploy() {
    console.log("📥 Cargando comandos...");
    await loadCommands(commandsPath);

    console.log(`📦 Comandos encontrados: ${commands.length}`);

    try {
        console.log("🚀 Registrando comandos...");

        await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: commands }
);

        console.log("✔ Comandos registrados correctamente.");
    } catch (error) {
        console.error("❌ Error registrando comandos:", error);
    }
}

deploy();
