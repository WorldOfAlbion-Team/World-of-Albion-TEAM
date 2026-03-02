// src/utils/voiceChannelValidator.js - Sistema de validación de canal de voz
import { log } from "./logger.js";

/**
 * Verifica si un usuario está en el canal de voz de un evento
 * @param {GuildMember} member - El miembro a verificar
 * @param {string} voiceChannelId - El ID del canal de voz del evento
 * @returns {boolean} - true si está en el canal, false si no
 */
export function isUserInVoiceChannel(member, voiceChannelId) {
    if (!member) {
        log.warn("Miembro no proporcionado para validación de voz");
        return false;
    }
    
    if (!voiceChannelId) {
        log.warn("ID de canal de voz no proporcionado");
        return false;
    }
    
    // Verificar si el miembro tiene un estado de voz
    if (!member.voice) {
        return false;
    }
    
    // Verificar si el miembro está en un canal de voz
    if (!member.voice.channelId) {
        return false;
    }
    
    // Verificar si el canal de voz coincide
    return member.voice.channelId === voiceChannelId;
}

/**
 * Verifica si el usuario está en el canal de voz del evento
 * Si no está, responde con un error efímero
 * @param {Interaction} interaction - La interacción de Discord
 * @param {string} voiceChannelId - El ID del canal de voz del evento
 * @returns {Promise<boolean>} - true si pasó la validación, false si no
 */
export async function validateVoiceChannel(interaction, voiceChannelId) {
    // Si no hay canal de voz configurado, permitir acceso
    if (!voiceChannelId) {
        return true;
    }
    
    // Obtener el miembro de la interacción
    const member = interaction.member;
    
    if (!member) {
        await interaction.reply({
            content: "❌ Error: No se pudo verificar tu membresía.",
            flags: 64
        });
        return false;
    }
    
    // Verificar si el usuario está en el canal de voz
    if (!isUserInVoiceChannel(member, voiceChannelId)) {
        // Intentar obtener el canal para mostrar un mejor mensaje
        let channelMention = "el canal de voz del evento";
        try {
            const voiceChannel = await interaction.guild.channels.fetch(voiceChannelId);
            if (voiceChannel) {
                channelMention = voiceChannel.toString();
            }
        } catch (e) {
            log.error("Error obteniendo canal de voz:", e);
        }
        
        await interaction.reply({
            content: `❌ Debes estar en ${channelMention} para usar esta función.`,
            flags: 64
        });
        return false;
    }
    
    return true;
}

/**
 * Obtiene el canal de voz del usuario actual
 * @param {GuildMember} member - El miembro
 * @returns {string|null} - El ID del canal de voz o null si no está en ninguno
 */
export function getUserVoiceChannelId(member) {
    if (!member || !member.voice) {
        return null;
    }
    return member.voice.channelId;
}

/**
 * Verifica si el usuario puede interactuar con el evento
 * (debe estar en el canal de voz del evento O ser el creador/admin)
 * @param {Interaction} interaction - La interacción
 * @param {Object} eventData - Datos del evento
 * @param {string} eventData.voiceChannelId - ID del canal de voz
 * @param {string} eventData.creatorId - ID del creador del evento
 * @returns {Promise<boolean>}
 */
export async function canInteractWithEvent(interaction, eventData) {
    const { voiceChannelId, creatorId } = eventData;
    const userId = interaction.user.id;
    const member = interaction.member;
    
    // Verificar si es el creador
    if (userId === creatorId) {
        return true;
    }
    
    // Verificar si es admin
    if (member.permissions.has("Administrator")) {
        return true;
    }
    
    // Verificar si está en el canal de voz
    return await validateVoiceChannel(interaction, voiceChannelId);
}

export default {
    isUserInVoiceChannel,
    validateVoiceChannel,
    getUserVoiceChannelId,
    canInteractWithEvent
};
