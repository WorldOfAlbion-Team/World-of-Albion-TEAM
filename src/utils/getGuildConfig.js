// src/utils/guildConfig.js
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const CONFIG_DIR = join(process.cwd(), "guild_configs");

// Crear carpeta si no existe
if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR);

export function getGuildConfig(tipo, guildId) {
    try {
        const file = join(CONFIG_DIR, `${guildId}.json`);
        if (!existsSync(file)) return null;
        const data = JSON.parse(readFileSync(file, "utf-8"));
        return data[tipo] || null;
    } catch {
        return null;
    }
}

export function setGuildConfig(tipo, guildId, data) {
    const file = join(CONFIG_DIR, `${guildId}.json`);
    let all = {};
    try { all = JSON.parse(readFileSync(file, "utf-8")); } catch {}
    all[tipo] = data;
    writeFileSync(file, JSON.stringify(all, null, 2));
}