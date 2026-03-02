import { EmbedBuilder } from "discord.js";
import { getLogChannel } from "../database.js";

export async function sendEventReport(interaction, event) {
    const logChannelId = await getLogChannel(interaction.guild.id);
    if (!logChannelId) return;

    const logChannel = interaction.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    // Detectar si es Dorados o Grupales para el título
    const isGrupales = event.titulo !== undefined;
    const tipoEvento = isGrupales ? `GRUPALES: ${event.titulo.toUpperCase()}` : "DORADOS BERCILIEN";
    
    // Lista de participantes sin emojis, limpia
    const participantes = Object.entries(event.roles)
        .map(([role, userId]) => `• ${role.toUpperCase()}: ${userId ? `<@${userId}>` : "Nadie"}`)
        .join("\n");

    const reportEmbed = new EmbedBuilder()
        .setTitle(`EVENTO CERRADO: ${tipoEvento}`)
        .setColor(0x2f3136) // Color gris oscuro neutro
        .addFields(
            { name: "CALLER", value: `<@${event.creatorId}>`, inline: true },
            { name: "HORA INICIO", value: event.hora || "No definida", inline: true },
            { name: "HORA CIERRE", value: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), inline: true }
        );

    // Si tiene facción (Grupales), añadirla al reporte
    if (event.faccion) {
        reportEmbed.addFields({ name: "FACCION", value: event.faccion.toUpperCase(), inline: true });
    }

    reportEmbed.addFields({ name: "PARTICIPANTES", value: participantes || "Sin participantes registrados" });

    await logChannel.send({ embeds: [reportEmbed] });
}