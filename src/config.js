import dotenv from 'dotenv';
dotenv.config();

export const config = {
    token: process.env.TOKEN,
    clienteId: "1424579146541039686",
    servidorId: "1417511080091062347",
    zonaHorariaPorDefecto: "America/Bogota",
    baseDeDatos: "json",
    colores: {
        albion: 0xFFD700,
        zvz: 0xFF6B6B,
        gvg: 0x4ECDC4,
        hce: 0x45B7D1,
        mazmorra: 0x96CEB4,
        faccion: 0xF7B731,
        transporte: 0xA29BFE
    }
};