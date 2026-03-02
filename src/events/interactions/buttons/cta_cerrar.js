import { EmbedBuilder } from "discord.js";
import { validateVoiceChannel } from "../../../utils/voiceChannelValidator.js";
import { log } from "../../../utils/logger.js";

export default async function (interaction) {
    if (interaction.customId !== "cta_cerrar") return;

    const creatorId = interaction.message.embeds[0]?.description?.match(/Caller: <@(\d+)>/)?.[1];
    
    if (interaction.user.id !== creatorId) {
        return interaction.reply({ content: "❌ Solo el caller puede cerrar el CTA.", flags: 64 });
    }

    // Obtener ID del canal de voz del embed
    const vozField = interaction.message.embeds[0]?.fields?.find(f => f.name === "🎙️ Voz");
    const voiceChannelMention = vozField?.value;
    
    // Extraer ID del canal de voz
    let voiceChannelId = null;
    if (voiceChannelMention) {
        const match = voiceChannelMention.match(/<#(\d+)>/);
        if (match) voiceChannelId = match[1];
    }

    // Validar canal de voz (si existe)
    if (voiceChannelId && !await validateVoiceChannel(interaction, voiceChannelId)) {
        return;
    }

    if (voiceChannelMention) {
        const voiceChannel = interaction.guild.channels.cache.find(c => c.name === voiceChannelMention.replace(/[<#>]/g, ""));
        if (voiceChannel) await voiceChannel.delete().catch(e => log.error("Error eliminando canal de voz CTA:", e));
    }

    await interaction.message.delete().catch(() => null);

    const embed = new EmbedBuilder()
        .setTitle("✅ CTA Cerrado")
        .setColor("#2ecc71")
        .setDescription("El CTA ha sido cerrado.")
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
}
