// src/utils/guildConfig.js
import { GuildConfig } from "../database.js";
import { logger } from "./logger.js";

/**
 * Guarda o actualiza la configuración de un tipo de evento para un servidor.
 * @param {string} tipo
 * @param {string} guildId
 * @param {object} data
 */
export async function setGuildConfig(tipo, guildId, data) {
    try {
        await GuildConfig.upsert({
            guildId,
            tipo,
            canalEmbedId: data.canalEmbedId,
            categoriaVozId: data.categoriaVozId
        });

        logger.info(`💾 Guardado en DB → ${guildId} | ${tipo}`);
    } catch (err) {
        logger.error("❌ Error guardando configuración en PostgreSQL:", err);
    }
}

/**
 * Obtiene la configuración de un tipo de evento.
 * @param {string} tipo
 * @param {string} guildId
 * @returns {object|null}
 */
export async function getGuildConfig(tipo, guildId) {
    try {
        const config = await GuildConfig.findOne({
            where: { guildId, tipo }
        });

        if (!config) return null;

        return {
            canalEmbedId: config.canalEmbedId,
            categoriaVozId: config.categoriaVozId
        };
    } catch (err) {
        logger.error("❌ Error leyendo configuración en PostgreSQL:", err);
        return null;
    }
}

/**
 * Obtiene TODAS las configuraciones de un servidor.
 * Útil para precargar todo al iniciar el bot.
 */
export async function getAllGuildConfigs(guildId) {
    try {
        const configs = await GuildConfig.findAll({
            where: { guildId }
        });

        const result = {};
        configs.forEach(c => {
            result[c.tipo] = {
                canalEmbedId: c.canalEmbedId,
                categoriaVozId: c.categoriaVozId
            };
        });

        return result;
    } catch (err) {
        logger.error("❌ Error leyendo todas las configuraciones:", err);
        return {};
    }
}
