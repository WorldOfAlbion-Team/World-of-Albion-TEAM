// src/utils/guildConfig.js
import { getEventChannelConfig } from "../database.js";

export function getGuildConfig(tipo, guildId) {
  const row = getEventChannelConfig(guildId, tipo);
  if (!row) return null;

  return {
    canalEmbedId: row.embed_channel_id,
    categoriaVozId: row.voice_category_id
  };
}

export function setGuildConfig(tipo, guildId, data) {
  // usa la misma función que registrar_canales
  return getEventChannelConfig(guildId, tipo); // solo lectura, no hace falta escribir aquí
}