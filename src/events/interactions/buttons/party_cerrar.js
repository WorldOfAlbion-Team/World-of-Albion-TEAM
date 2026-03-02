import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { getPartyEventByMessageId, closePartyEvent } from "../../../database.js";
import { log } from "../../../utils/logger.js";
import { canInteractWithEvent } from "../../../utils/voiceChannelValidator.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("party_cerrar_")) return;

    const eventId = interaction.customId.replace("party_cerrar_", "");
    
    const event = await getPartyEventByMessageId(eventId);
    if (!event) {
        return interaction.reply({ 
            content: "❌ Evento no encontrado.", 
            flags: 64 
        });
    }

    // Verificar permisos (solo creador o admin)
    const isCreator = interaction.user.id === event.leader_id;
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isCreator && !isAdmin) {
        return interaction.reply({ 
            content: "❌ Solo el creador o un Administrador pueden cerrar la party.", 
            flags: 64 
        });
    }

    // Verificar si está en el canal de voz O es el creador/admin
    if (!isCreator && !isAdmin) {
        const canInteract = await canInteractWithEvent(interaction, {
            voiceChannelId: event.voice_channel_id,
            creatorId: event.leader_id
        });
        if (!canInteract) return;
    }

    try {
        // Eliminar canal de voz si existe
        if (event.voice_channel_id) {
            try {
                const voiceChannel = await interaction.guild.channels.fetch(event.voice_channel_id);
                if (voiceChannel) await voiceChannel.delete();
            } catch (e) {
                log.error("Error eliminando canal de voz:", e);
            }
        }

        // Eliminar embed
        await interaction.message.delete().catch(() => null);

        // Cerrar en base de datos
        await closePartyEvent(eventId);

        log.info(`Party ${event.titulo} cerrada por ${interaction.user.id}`);

        await interaction.reply({ 
            content: "🔒 Party cerrada exitosamente.", 
            flags: 64 
        });

    } catch (error) {
        log.error("Error cerrando party:", error);
        await interaction.reply({ 
            content: "❌ Error al cerrar la party.", 
            flags: 64 
        });
    }
};
