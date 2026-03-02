import { EmbedBuilder, MessageFlags } from "discord.js";
import { validateVoiceChannel } from "../../../utils/voiceChannelValidator.js";
import { log } from "../../../utils/logger.js";

// Almacenar participantes CTA (en memoria o DB)
export const ctaParticipants = new Map();

const CATEGORY_TYPES = {
    SAGRADOS: "HEALS",
    GUANTES: "SUPPORTS",
    FUEGO: "DPS",
    NATURAL: "DPS",
    MAZAS: "TANKS",
    MARTILLOS: "TANKS",
    LANZAS: "TANKS",
    HACHAS: "TANKS",
    ESPADAS: "TANKS",
    HIELO: "DPS",
    DAGAS: "DPS",
    CAMBIAFORMAS: "DPS",
    MALDICIONES: "DPS",
    VARAS: "DPS",
    BALLESTAS: "DPS",
    ARCOS: "DPS",
    ARCANOS: "DPS"
};

export default async function (interaction) {
    if (interaction.customId !== "cta_unirse") return;

    const value = interaction.values[0];
    const userId = interaction.user.id;
    const messageId = interaction.message.id;

    // Obtener ID del canal de voz del embed
    const vozField = interaction.message.embeds[0]?.fields?.find(f => f.name === "🎙️ Voz");
    let voiceChannelId = null;
    if (vozField?.value) {
        const match = vozField.value.match(/<#(\d+)>/);
        if (match) voiceChannelId = match[1];
    }

    // Validar canal de voz (si existe)
    if (voiceChannelId && !await validateVoiceChannel(interaction, voiceChannelId)) {
        return;
    }

    // Obtener datos del embed
    const embed = interaction.message.embeds[0];
    const fields = [...embed.data.fields];

    // Obtener participantes actuales
    const participants = ctaParticipants.get(messageId) || {};
    const participantCount = Object.keys(participants).length;
    const MAX_PARTICIPANTS = 21;
    const MIN_PARTICIPANTS = 2;

    // Desanotarse
    if (value === "desanotarse") {
        if (!participants[userId]) {
            return interaction.reply({ content: "❌ No estás anotado.", flags: MessageFlags.Ephemeral });
        }

        // Buscar y reemplazar
        for (let i = 0; i < fields.length; i++) {
            if (fields[i].value.includes(`<@${userId}>`)) {
                fields[i].value = fields[i].value.replace(`<@${userId}>`, "(0/1)");
                delete participants[userId];
                ctaParticipants.set(messageId, participants);
            }
        }

        const nuevoEmbed = EmbedBuilder.from(embed).setFields(fields);
        return interaction.update({ embeds: [nuevoEmbed] });
    }

    // Verificar límite
    if (participantCount >= MAX_PARTICIPANTS) {
        return interaction.reply({ content: `❌ Máximo ${MAX_PARTICIPANTS} participantes.`, flags: MessageFlags.Ephemeral });
    }

    // Verificar si ya está anotado
    if (participants[userId]) {
        return interaction.reply({ content: "❌ Ya estás anotado.", flags: MessageFlags.Ephemeral });
    }

    const indexElegido = parseInt(value);
    let actualizado = false;

    for (let i = 0; i < fields.length; i++) {
        if (fields[i].name === "⚔️ DPS" || fields[i].name === "🛡️ TANKS" || 
            fields[i].name === "💚 HEALS" || fields[i].name === "✨ SUPPORTS" ||
            fields[i].value?.includes("(0/1)")) {
            
            const lineas = fields[i].value.split("\n");
            const nuevaLista = lineas.map(linea => {
                if (linea.startsWith(`**${indexElegido + 1}.**`) && linea.includes("(0/1)")) {
                    actualizado = true;
                    participants[userId] = indexElegido;
                    ctaParticipants.set(messageId, participants);
                    return linea.replace("(0/1)", `<@${userId}>`);
                }
                return linea;
            }).join("\n");
            fields[i].value = nuevaLista;
        }
    }

    if (!actualizado) {
        return interaction.reply({ content: "❌ Puesto ocupado o inválido.", flags: MessageFlags.Ephemeral });
    }

    try {
        const nuevoEmbed = EmbedBuilder.from(embed).setFields(fields);
        await interaction.update({ embeds: [nuevoEmbed] });
    } catch (error) {
        log.error("Error en cta_unirse:", error);
    }
}
