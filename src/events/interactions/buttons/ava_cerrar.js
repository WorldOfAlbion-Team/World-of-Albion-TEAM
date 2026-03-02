import { activeEvents } from "../../../state/activeEvents.js";
import { log } from "../../../utils/logger.js";
import { getAvaEventByMessageId, closeAvaEvent } from "../../../database.js";
import { canInteractWithEvent } from "../../../utils/voiceChannelValidator.js";

// Botón: Cerrar Party AVA
export default async function (interaction) {
    if (interaction.customId !== "ava_cerrar") return;

    const messageId = interaction.message.id;
    const eventData = await getAvaEventByMessageId(messageId);

    if (!eventData) {
        return interaction.reply({ content: "❌ Este evento no existe o ya fue cerrado.", flags: 64 });
    }

    // Solo el creador puede cerrar
    if (eventData.leader_id !== interaction.user.id) {
        return interaction.reply({ content: "❌ Solo el creador puede cerrar la party.", flags: 64 });
    }

    // Verificar si puede interactuar (creador, admin o en canal de voz)
    const canInteract = await canInteractWithEvent(interaction, {
        voiceChannelId: eventData.voice_channel_id,
        creatorId: eventData.leader_id
    });
    
    if (!canInteract) {
        return;
    }

    try {
        // Eliminar canal de voz si existe
        if (eventData.voice_channel_id) {
            const voiceChannel = await interaction.guild.channels.fetch(eventData.voice_channel_id);
            if (voiceChannel) await voiceChannel.delete();
        }

        // Eliminar embed
        await interaction.message.delete();

        // Cerrar en base de datos
        await closeAvaEvent(messageId);

        // Eliminar de eventos en memoria si existe
        activeEvents.delete(messageId);

        log.info(`Party AVA ${messageId} cerrada por ${interaction.user.id}`);
    } catch (error) {
        log.error("Error cerrando party AVA:", error);
        await interaction.reply({ content: "❌ Error al cerrar la party.", flags: 64 });
    }
};
