export function getColor(type) {
    const colors = {
        albion: 0xFFD700,
        zvz: 0xFF6B6B,
        gvg: 0x4ECDC4,
        hce: 0x45B7D1,
        mazmorra: 0x96CEB4,
        faccion: 0xF7B731,
        transporte: 0xA29BFE
    };
    return colors[type] || 0x000000;
}