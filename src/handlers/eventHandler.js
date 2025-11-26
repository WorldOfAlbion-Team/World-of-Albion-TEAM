// src/handlers/eventHandler.js
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadEvents(client) {
    const eventsPath = join(__dirname, "../events");
    const files = readdirSync(eventsPath).filter(f => f.endsWith(".js"));

    for (const file of files) {
        const filePath = join(eventsPath, file);
        const event = await import(`file://${filePath}`);
        const evt = event.default;

        if (!evt || !evt.name || !evt.execute) {
            logger.warn(`⚠️ Evento inválido: ${file}`);
            continue;
        }

        client.on(evt.name, (...args) => evt.execute(...args));
        logger.info(`✔ Evento cargado: ${evt.name}`);
    }
}