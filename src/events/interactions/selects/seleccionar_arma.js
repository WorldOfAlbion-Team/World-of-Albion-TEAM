import { EmbedBuilder, PermissionFlagsBits, ChannelType } from "discord.js";
import { getPartyEventByMessageId, addPartyParticipant } from "../../../database.js";
import { log } from "../../../utils/logger.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("seleccionar_arma_")) return;

    const [_, eventId, userId] = interaction.customId.split("_");
    const selectedValue = interaction.values[0];

    // Verificar que es el usuario correcto
    if (interaction.user.id !== userId) {
        return interaction.reply({ 
            content: "❌ No puedes seleccionar arma para otro usuario.", 
            flags: 64 
        });
    }

    const event = await getPartyEventByMessageId(eventId);
    if (!event) {
        return interaction.reply({ 
            content: "❌ Evento no encontrado.", 
            flags: 64 
        });
    }

    // Parsear arma y categoría
    const [arma, categoria] = selectedValue.split("_");

    // Registrar participante
    await addPartyParticipant(event.id, userId, categoria);

    // Otorgar permisos del canal de voz
    if (event.voice_channel_id) {
        try {
            const voiceChannel = await interaction.guild.channels.fetch(event.voice_channel_id);
            if (voiceChannel) {
                await voiceChannel.permissionOverwrites.create(userId, {
                    ViewChannel: true,
                    Connect: true,
                    Speak: true
                });
            }
        } catch (e) {
            log.error("Error otorgando permisos:", e);
        }
    }

    const armaTexto = arma === "ninguna" ? "Sin arma específica" : arma;

    const embed = new EmbedBuilder()
        .setTitle("✅ Te has unido a la party")
        .setColor("#2ecc71")
        .setDescription(`¡<@${userId}> se ha joined a **${categoria.toUpperCase()}**!`)
        .addFields(
            { name: "🗡️ Arma", value: armaTexto, inline: true },
            { name: "🎙️ Canal de Voz", value: `<#${event.voice_channel_id}>`, inline: true }
        )
        .setTimestamp();

    await interaction.update({
        content: "",
        embeds: [embed],
        components: []
    });
};
