// src/utils/logger.js - Sistema de logging profesional (sin dependencias externas)
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores ANSI para la consola
const colors = {
    info: '\x1b[36m',    // Cyan
    warn: '\x1b[33m',    // Amarillo
    error: '\x1b[31m',   // Rojo
    debug: '\x1b[35m',    // Magenta
    reset: '\x1b[0m'
};

// Formato de timestamp
function getTimestamp() {
    return new Date().toISOString();
}

// Logger principal
export const logger = {
    info: (message) => console.log(`${colors.info}[INFO]${colors.reset} ${getTimestamp()}: ${message}`),
    error: (message, error = null) => {
        console.error(`${colors.error}[ERROR]${colors.reset} ${getTimestamp()}: ${message}`);
        if (error) console.error(`${colors.error}[ERROR]${colors.reset} ${error.message || error}`);
    },
    warn: (message) => console.warn(`${colors.warn}[WARN]${colors.reset} ${getTimestamp()}: ${message}`),
    debug: (message) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`${colors.debug}[DEBUG]${colors.reset} ${getTimestamp()}: ${message}`);
        }
    }
};

// Métodos de conveniencia
export const log = {
    info: (message, meta = {}) => logger.info(`${message} ${JSON.stringify(meta)}`),
    error: (message, error = null) => logger.error(message, error),
    warn: (message, meta = {}) => logger.warn(`${message} ${JSON.stringify(meta)}`),
    debug: (message, meta = {}) => {
        if (process.env.NODE_ENV === 'development') logger.debug(`${message} ${JSON.stringify(meta)}`);
    },
    command: (commandName, userId, guildId) => {
        logger.info(`Comando ejecutado: ${commandName} por usuario ${userId} en guild ${guildId}`);
    },
    interaction: (interactionType, customId) => {
        logger.info(`Interacción: ${interactionType} | CustomID: ${customId}`);
    },
    db: (operation, success = true) => {
        logger.info(`Database ${operation}: ${success ? 'ÉXITO' : 'FALLO'}`);
    }
};

export default logger;
