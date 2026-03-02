// ===============================
// 🤖 BOT INFO
// ===============================
export const BOT_NAME = "WorldOfAlbionBOT";

// ===============================
// 👑 OWNER / GUILD PRINCIPAL
// ===============================
export const OWNER_ID = "1074466114811215882";
export const MAIN_GUILD_ID = "1417511080091062347";
export const CLIENT_ID = "1424579146541039686";

// ===============================
// 🛡️ ROL ADMIN (opcional)
// ===============================
export const ADMIN_ROLE_ID = null;

// ===============================
// 🔐 REQUIEREN WHITELIST (TODOS LOS COMANDOS EXCEPTO PING, INFO, SERVER)
// ===============================
export const WHITELIST_REQUIRED_COMMANDS = [
  "ping",
  "info",
  "server",
  "registrar_canales",
  "set_canal_eventos",
  "allow_role",
  "remove_role",
  "list_roles",
  "armar_party",
  "party_dorados",
  "party_grupales",
  "ava",
  "cta",
  "azar",
  "eventos_activos",
  "set_canal_eventos",
  "config_logs",
  "stats",
  "whitelist",
  "whitelist_add",
  "whitelist_remove",
  "whitelist_list",
  "plantillas",
  "plantilla_usar",
  "plantilla_guardar",
  "plantilla_crear",
  "plantilla_editar",
  "plantilla_eliminar",
  "plantilla_list",
  "plantillas_guardadas"
];

// ===============================
// 👑 SOLO OWNER
// ===============================
export const OWNER_ONLY_COMMANDS = [
  "reply",
  "stats_global",
  "whitelist_add",
  "whitelist_remove",
  "whitelist_list",
  "plantilla_eliminar"
];