import pkg from "pg";
const { Pool } = pkg;
import { logger } from "./utils/logger.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

let dbAvailable = true;

// Verificar conexión al inicio
pool.on("error", (err) => {
  logger.error("❌ Error en pool de PostgreSQL:", err.message);
  dbAvailable = false;
});

// Función helper para manejar queries opcionales
async function safeQuery(query, params = []) {
  if (!dbAvailable) {
    logger.warn("⚠️  Base de datos no disponible, operación ignorada");
    return { rows: [] };
  }
  return await pool.query(query, params);
}

export async function initDatabase() {
  await safeQuery(`
    CREATE TABLE IF NOT EXISTS guilds (
      guild_id TEXT PRIMARY KEY,
      whitelisted BOOLEAN DEFAULT false
    );
    CREATE TABLE IF NOT EXISTS guild_channels (
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT,
      log_channel_id TEXT
    );
    CREATE TABLE IF NOT EXISTS guild_roles (
      guild_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      PRIMARY KEY (guild_id, role_id)
    );
    CREATE TABLE IF NOT EXISTS event_channel_config (
      guild_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      embed_channel_id TEXT NOT NULL,
      voice_category_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (guild_id, event_type)
    );
    
    -- Tablas para AVA
    CREATE TABLE IF NOT EXISTS ava_events (
      id SERIAL PRIMARY KEY,
      message_id TEXT NOT NULL UNIQUE,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      voice_channel_id TEXT,
      titulo TEXT NOT NULL,
      tier TEXT NOT NULL,
      lugar TEXT NOT NULL,
      hora TEXT NOT NULL,
      descripcion TEXT DEFAULT '',
      tipo TEXT NOT NULL,
      leader_id TEXT NOT NULL,
      roles_data JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW(),
      closed_at TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS ava_participants (
      id SERIAL PRIMARY KEY,
      event_id INTEGER REFERENCES ava_events(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      role_index INTEGER NOT NULL,
      joined_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(event_id, user_id)
    );
    
    -- Tablas para Parties
    CREATE TABLE IF NOT EXISTS party_events (
      id SERIAL PRIMARY KEY,
      message_id TEXT NOT NULL UNIQUE,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      voice_channel_id TEXT,
      titulo TEXT NOT NULL,
      tier TEXT NOT NULL,
      lugar TEXT NOT NULL,
      hora TEXT NOT NULL,
      descripcion TEXT DEFAULT '',
      party_type TEXT NOT NULL,
      leader_id TEXT NOT NULL,
      roles_data JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW(),
      closed_at TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS party_participants (
      id SERIAL PRIMARY KEY,
      event_id INTEGER REFERENCES party_events(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      role_index INTEGER NOT NULL,
      joined_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(event_id, user_id)
    );
    
    -- Tablas para Plantillas
    CREATE TABLE IF NOT EXISTS templates (
      id SERIAL PRIMARY KEY,
      guild_id TEXT NOT NULL,
      name TEXT NOT NULL,
      tipo TEXT NOT NULL,
      titulo TEXT NOT NULL,
      tier TEXT NOT NULL,
      lugar TEXT NOT NULL,
      hora TEXT NOT NULL,
      descripcion TEXT DEFAULT '',
      roles_data JSONB NOT NULL DEFAULT '[]',
      canal_id TEXT,
      created_by TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP,
      UNIQUE(guild_id, name)
    );
    
    -- Tablas para CTA
    CREATE TABLE IF NOT EXISTS cta_events (
      id SERIAL PRIMARY KEY,
      message_id TEXT NOT NULL UNIQUE,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      voice_channel_id TEXT,
      titulo TEXT NOT NULL,
      lugar TEXT NOT NULL,
      hora TEXT NOT NULL,
      descripcion TEXT DEFAULT '',
      roles_data JSONB NOT NULL DEFAULT '[]',
      creator_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      closed_at TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS cta_participants (
      id SERIAL PRIMARY KEY,
      event_id INTEGER REFERENCES cta_events(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      role_index INTEGER NOT NULL,
      joined_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(event_id, user_id)
    );
  `);
  logger.info("✅ PostgreSQL inicializado");
}

/* --- FUNCIONES DE WHITELIST --- */
export async function isGuildWhitelisted(guildId) {
  const res = await safeQuery("SELECT whitelisted FROM guilds WHERE guild_id = $1", [guildId]);
  return res.rows[0]?.whitelisted || false;
}

export async function addGuildToWhitelist(guildId) {
  await safeQuery(
    "INSERT INTO guilds (guild_id, whitelisted) VALUES ($1, true) ON CONFLICT (guild_id) DO UPDATE SET whitelisted = true",
    [guildId]
  );
}

export async function getWhitelistedGuilds() {
  const res = await safeQuery("SELECT guild_id FROM guilds WHERE whitelisted = true");
  return res.rows;
}

export async function purgeGuildData(guildId) {
  if (!dbAvailable) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM guilds WHERE guild_id = $1', [guildId]);
    await client.query('DELETE FROM guild_channels WHERE guild_id = $1', [guildId]);
    await client.query('DELETE FROM guild_roles WHERE guild_id = $1', [guildId]);
    await client.query('DELETE FROM event_channel_config WHERE guild_id = $1', [guildId]);
    await client.query('COMMIT');
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/* --- FUNCIONES DE ROLES --- */
export async function allowRole(guildId, roleId) {
  await safeQuery("INSERT INTO guild_roles (guild_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [guildId, roleId]);
}

export async function removeRole(guildId, roleId) {
  await safeQuery("DELETE FROM guild_roles WHERE guild_id = $1 AND role_id = $2", [guildId, roleId]);
}

export async function getAllowedRoles(guildId) {
  const res = await safeQuery("SELECT role_id FROM guild_roles WHERE guild_id = $1", [guildId]);
  return res.rows.map(r => r.role_id);
}

/* --- FUNCIONES DE CONFIGURACIÓN --- */
export async function getLogChannel(guildId) {
  const res = await safeQuery("SELECT log_channel_id FROM guild_channels WHERE guild_id = $1", [guildId]);
  return res.rows[0]?.log_channel_id || null;
}

export async function setLogChannel(guildId, channelId) {
  await safeQuery(
    `INSERT INTO guild_channels (guild_id, log_channel_id) 
     VALUES ($1, $2) 
     ON CONFLICT (guild_id) DO UPDATE SET log_channel_id = EXCLUDED.log_channel_id`,
    [guildId, channelId]
  );
}

export async function setEventChannelConfig(guildId, eventType, embedChannelId, voiceCategoryId) {
  await safeQuery(
    `INSERT INTO event_channel_config (guild_id, event_type, embed_channel_id, voice_category_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (guild_id, event_type)
     DO UPDATE SET embed_channel_id = EXCLUDED.embed_channel_id, voice_category_id = EXCLUDED.voice_category_id`,
    [guildId, eventType, embedChannelId, voiceCategoryId]
  );
}

export async function getEventChannelConfig(guildId, eventType) {
  const res = await safeQuery(
    "SELECT embed_channel_id, voice_category_id FROM event_channel_config WHERE guild_id = $1 AND event_type = $2",
    [guildId, eventType]
  );
  return res.rows[0] || null;
}

export async function setGuildChannel(guildId, channelId) {
  return setLogChannel(guildId, channelId);
}

/* --- FUNCIONES DE AVA --- */
export async function saveAvaEvent(messageId, guildId, channelId, voiceChannelId, titulo, tier, lugar, hora, descripcion, tipo, leaderId, rolesData) {
  const res = await safeQuery(
    `INSERT INTO ava_events (message_id, guild_id, channel_id, voice_channel_id, titulo, tier, lugar, hora, descripcion, tipo, leader_id, roles_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id`,
    [messageId, guildId, channelId, voiceChannelId, titulo, tier, lugar, hora, descripcion, tipo, leaderId, JSON.stringify(rolesData)]
  );
  return res.rows[0]?.id;
}

export async function getAvaEventByMessageId(messageId) {
  const res = await safeQuery("SELECT * FROM ava_events WHERE message_id = $1", [messageId]);
  return res.rows[0] || null;
}

export async function getAvaEventById(id) {
  const res = await safeQuery("SELECT * FROM ava_events WHERE id = $1", [id]);
  return res.rows[0] || null;
}

export async function getAvaParticipants(eventId) {
  const res = await safeQuery("SELECT * FROM ava_participants WHERE event_id = $1 ORDER BY joined_at", [eventId]);
  return res.rows;
}

export async function addAvaParticipant(eventId, userId, roleIndex) {
  await safeQuery(
    `INSERT INTO ava_participants (event_id, user_id, role_index)
     VALUES ($1, $2, $3)
     ON CONFLICT (event_id, user_id) DO UPDATE SET role_index = EXCLUDED.role_index`,
    [eventId, userId, roleIndex]
  );
}

export async function removeAvaParticipant(eventId, userId) {
  await safeQuery("DELETE FROM ava_participants WHERE event_id = $1 AND user_id = $2", [eventId, userId]);
}

export async function closeAvaEvent(messageId) {
  await safeQuery("UPDATE ava_events SET closed_at = NOW() WHERE message_id = $1", [messageId]);
}

export async function deleteAvaEvent(messageId) {
  await safeQuery("DELETE FROM ava_events WHERE message_id = $1", [messageId]);
}

/* --- FUNCIONES DE PARTIES --- */
export async function savePartyEvent(messageId, guildId, channelId, voiceChannelId, titulo, tier, lugar, hora, descripcion, partyType, leaderId, rolesData) {
  const res = await safeQuery(
    `INSERT INTO party_events (message_id, guild_id, channel_id, voice_channel_id, titulo, tier, lugar, hora, descripcion, party_type, leader_id, roles_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id`,
    [messageId, guildId, channelId, voiceChannelId, titulo, tier, lugar, hora, descripcion, partyType, leaderId, JSON.stringify(rolesData)]
  );
  return res.rows[0]?.id;
}

export async function getPartyEventByMessageId(messageId) {
  const res = await safeQuery("SELECT * FROM party_events WHERE message_id = $1", [messageId]);
  return res.rows[0] || null;
}

export async function getPartyEventById(id) {
  const res = await safeQuery("SELECT * FROM party_events WHERE id = $1", [id]);
  return res.rows[0] || null;
}

export async function getPartyParticipants(eventId) {
  const res = await safeQuery("SELECT * FROM party_participants WHERE event_id = $1 ORDER BY joined_at", [eventId]);
  return res.rows;
}

export async function addPartyParticipant(eventId, userId, roleIndex) {
  await safeQuery(
    `INSERT INTO party_participants (event_id, user_id, role_index)
     VALUES ($1, $2, $3)
     ON CONFLICT (event_id, user_id) DO UPDATE SET role_index = EXCLUDED.role_index`,
    [eventId, userId, roleIndex]
  );
}

export async function removePartyParticipant(eventId, userId) {
  await safeQuery("DELETE FROM party_participants WHERE event_id = $1 AND user_id = $2", [eventId, userId]);
}

export async function closePartyEvent(messageId) {
  await safeQuery("UPDATE party_events SET closed_at = NOW() WHERE message_id = $1", [messageId]);
}

export async function deletePartyEvent(messageId) {
  await safeQuery("DELETE FROM party_events WHERE message_id = $1", [messageId]);
}

/* --- FUNCIONES DE PLANTILLAS --- */
export async function createTemplate(guildId, name, tipo, titulo, tier, lugar, hora, descripcion, rolesData, canalId) {
  const res = await safeQuery(
    `INSERT INTO templates (guild_id, name, tipo, titulo, tier, lugar, hora, descripcion, roles_data, canal_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [guildId, name, tipo, titulo, tier, lugar, hora, descripcion || '', JSON.stringify(rolesData), canalId]
  );
  return res.rows[0]?.id;
}

export async function getTemplate(guildId, name) {
  const res = await safeQuery("SELECT * FROM templates WHERE guild_id = $1 AND name = $2", [guildId, name]);
  return res.rows[0] || null;
}

export async function getTemplateById(id) {
  const res = await safeQuery("SELECT * FROM templates WHERE id = $1", [id]);
  return res.rows[0] || null;
}

export async function getAllTemplates(guildId) {
  const res = await safeQuery("SELECT * FROM templates WHERE guild_id = $1 ORDER BY created_at DESC", [guildId]);
  return res.rows;
}

export async function updateTemplate(id, titulo, tier, lugar, hora, descripcion, rolesData, canalId) {
  await safeQuery(
    `UPDATE templates 
     SET titulo = $2, tier = $3, lugar = $4, hora = $5, descripcion = $6, roles_data = $7, canal_id = $8, updated_at = NOW()
     WHERE id = $1`,
    [id, titulo, tier, lugar, hora, descripcion || '', JSON.stringify(rolesData), canalId]
  );
}

export async function deleteTemplate(id) {
  await safeQuery("DELETE FROM templates WHERE id = $1", [id]);
}

/* --- FUNCIONES DE CTA --- */
export async function saveCtaEvent(messageId, guildId, channelId, voiceChannelId, titulo, lugar, hora, descripcion, rolesData, creatorId) {
  const res = await safeQuery(
    `INSERT INTO cta_events (message_id, guild_id, channel_id, voice_channel_id, titulo, lugar, hora, descripcion, roles_data, creator_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [messageId, guildId, channelId, voiceChannelId, titulo, lugar, hora, descripcion || '', JSON.stringify(rolesData), creatorId]
  );
  return res.rows[0]?.id;
}

export async function getCtaEventByMessageId(messageId) {
  const res = await safeQuery("SELECT * FROM cta_events WHERE message_id = $1", [messageId]);
  return res.rows[0] || null;
}

export async function getCtaEventById(id) {
  const res = await safeQuery("SELECT * FROM cta_events WHERE id = $1", [id]);
  return res.rows[0] || null;
}

export async function getCtaParticipants(eventId) {
  const res = await safeQuery("SELECT * FROM cta_participants WHERE event_id = $1 ORDER BY joined_at", [eventId]);
  return res.rows;
}

export async function addCtaParticipant(eventId, userId, roleIndex) {
  await safeQuery(
    `INSERT INTO cta_participants (event_id, user_id, role_index)
     VALUES ($1, $2, $3)
     ON CONFLICT (event_id, user_id) DO UPDATE SET role_index = EXCLUDED.role_index`,
    [eventId, userId, roleIndex]
  );
}

export async function removeCtaParticipant(eventId, userId) {
  await safeQuery("DELETE FROM cta_participants WHERE event_id = $1 AND user_id = $2", [eventId, userId]);
}

export async function closeCtaEvent(messageId) {
  await safeQuery("UPDATE cta_events SET closed_at = NOW() WHERE message_id = $1", [messageId]);
}

export async function deleteCtaEvent(messageId) {
  await safeQuery("DELETE FROM cta_events WHERE message_id = $1", [messageId]);
}

export default pool;
