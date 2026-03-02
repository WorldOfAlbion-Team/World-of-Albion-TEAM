import { EmbedBuilder, MessageFlags } from "discord.js";
import { getAvaEventByMessageId, getAvaParticipants, removeAvaParticipant } from "../../../database.js";
import { log } from "../../../utils/logger.js";
import { validateVoiceChannel } from "../../../utils/voiceChannelValidator.js";

// Botón: Salir de Party AVA
export default async function (interaction) {
    if (interaction.customId !== "ava_salir") return;

    const messageId = interaction.message.id;
    const eventData = await getAvaEventByMessageId(messageId);
    const userId = interaction.user.id;

    if (!eventData) {
        return interaction.reply({ content: "❌ Este evento no existe o ya fue cerrado.", flags: 64 });
    }

    // Validar canal de voz (si existe)
    if (eventData.voice_channel_id && !await validateVoiceChannel(interaction, eventData.voice_channel_id)) {
        return;
    }

    // Verificar que el usuario esté en la party
    const participants = await getAvaParticipants(eventData.id);
    const participant = participants.find(p => p.user_id === userId);

    if (!participant) {
        return interaction.reply({ content: "❌ No estás en esta party.", flags: MessageFlags.Ephemeral });
    }

    // Remover de la base de datos
    await removeAvaParticipant(eventData.id, userId);

    // Actualizar embed - buscar y reemplazar al usuario
    const embedOriginal = interaction.message.embeds[0];
    const fields = [...embedOriginal.data.fields];
    
    let encontrado = false;
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].value.includes(`<@${userId}>`)) {
            fields[i].value = fields[i].value.replace(`<@${userId}>`, "**(0/1)**");
            encontrado = true;
        }
    }

    if (encontrado) {
        const nuevoEmbed = EmbedBuilder.from(embedOriginal).setFields(fields);
        await interaction.update({ embeds: [nuevoEmbed] });
    } else {
        await interaction.reply({ content: "✅ Te has removido de la party.", flags: MessageFlags.Ephemeral });
    }

    log.info(`Usuario ${userId} salió de evento AVA ${messageId}`);
};
