// src/handlers/commandHandler.js
import { Collection } from "discord.js";
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadCommands(client) {
    client.commands = new Collection();

    const commandsPath = join(__dirname, "../commands");
    const folders = readdirSync(commandsPath);

    for (const folder of folders) {
        const folderPath = join(commandsPath, folder);
        const files = readdirSync(folderPath).filter(f => f.endsWith(".js"));

        for (const file of files) {
            const filePath = join(folderPath, file);
            const command = await import(`file://${filePath}`);

            if (!command.default || !command.default.data || !command.default.execute) {
                logger.warn(`⚠️ Comando inválido: ${file}`);
                continue;
            }

            client.commands.set(command.default.data.name, command.default);
            logger.info(`✔ Comando cargado: ${command.default.data.name}`);
        }
    }
}