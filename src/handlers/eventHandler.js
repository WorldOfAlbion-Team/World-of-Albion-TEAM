import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadEvents(client) {
  const eventsPath = path.join(__dirname, "../events");
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

  for (const file of eventFiles) {
    try {
      const filePath = path.join(eventsPath, file);
      const imported = await import(filePath);
      const event = imported.default;

      if (!event) {
        logger.warn(`⚠ Evento sin export default: ${file}`);
        continue;
      }

      if (!event.name || !event.execute) {
        logger.warn(`⚠ Evento inválido ignorado: ${file}`);
        continue;
      }

      client.on(event.name, (...args) => event.execute(...args));
      logger.info(`✔ Evento cargado: ${event.name}`);
    } catch (err) {
      logger.error(`❌ Error cargando evento ${file}`);
      logger.error(err?.stack || err);
    }
  }
}
