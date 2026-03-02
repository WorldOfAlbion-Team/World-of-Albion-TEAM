// src/utils/colors.js - Paleta de colores profesional para Albion Online

export const COLORS = {
    // Colores principales
    albion: 0xFFD700,           // Dorado de Albion
    primary: 0x6B5B95,          // Púrpura principal
    success: 0x57C289,          // Verde éxito
    warning: 0xF7B731,          // Amarillo advertencia
    error: 0xE74C3C,            // Rojo error
    info: 0x3498DB,             // Azul información
    
    // Tipos de eventos
    zvz: 0xFF6B6B,              // ZVZ - Rojo intenso
    gvg: 0x4ECDC4,               // GVG - Turquesa
    hce: 0x45B7D1,               // HCE - Azul claro
    mazmorra: 0x96CEB4,         // Mazmorras - Verde suave
    faction: 0xF39C12,          // Facción - Naranja
    transporte: 0xA29BFE,       // Transporte - Violeta
    corrupcion: 0xE74C3C,       // Corrupción - Rojo oscuro
    
    // Roles
    tank: 0x95A5A6,             // Gris tank
    heal: 0x2ECC71,             // Verde healer
    dps: 0xE74C3C,              // Rojo DPS
    support: 0x9B59B6,          // Morado support
    
    // Partys
    dorados: 0xFFD700,          // Party Dorados
    grupales: 0xFF6B6B,         // Party Grupales
    personalizadas: 0x45B7D1,  // Party Personalizadas
    
    // Rareza de items
    Comun: 0x9E9E9E,
    PocoComun: 0x4CAF50,
    Raro: 0x2196F3,
    Epico: 0x9C27B0,
    Legendario: 0xFFD700,
    Mythic: 0xFF5722
};

export const RARITY_COLORS = {
    0: COLORS.Comun,
    1: COLORS.PocoComun,
    2: COLORS.Raro,
    3: COLORS.Epico,
    4: COLORS.Legendario,
    5: COLORS.Mythic
};

// Obtener color por tipo
export function getColor(type) {
    return COLORS[type] || COLORS.primary;
}

// Obtener color por rareza
export function getRarityColor(tier) {
    if (tier >= 8) return COLORS.Mythic;
    if (tier >= 5) return COLORS.Legendario;
    if (tier >= 4) return COLORS.Epico;
    if (tier >= 3) return COLORS.Raro;
    if (tier >= 2) return COLORS.PocoComun;
    return COLORS.Comun;
}

export default COLORS;
