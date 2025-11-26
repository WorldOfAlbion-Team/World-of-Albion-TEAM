// src/events/interactions/buttons/button-grupales.js
import { EmbedBuilder } from "discord.js";
import { activeEvents } from "../../../state/activeEvents.js";
import { logger } from "../../../utils/logger.js";
import { ROLES } from "../../../constants/emojis.js";

export default async function (interaction) {
    logger.info(`[button-grupales] customId recibido: ${interaction.customId}`);
    const [prefixRaw, eventId] = interaction.customId.split("|");
    const action = prefixRaw.replace("grupales-", ""); // "salir" o "cerrar"

    logger.info(`[button-grupales] ¿eventId existe? ${activeEvents.has(eventId)}`);
    logger.info(`[button-grupales] total eventos en Map: ${activeEvents.size}`);

    const event = activeEvents.get(eventId);
    if (!event) {
        logger.error(`[button-grupales] eventId "${eventId}" no encontrado`);
        return interaction.reply({ content: "❌ Evento no encontrado.", flags: [64] });
    }

    const userId = interaction.user.id;

    if (action === "salir") {
        for (const r in event.roles) if (event.roles[r] === userId) event.roles[r] = null;
        event.participantes.delete(userId);
    } else if (action === "cerrar") {
        if (userId !== event.creatorId)
            return interaction.reply({ content: "❌ Solo el creador puede cerrar.", flags: [64] });
        try {
            const ch = interaction.guild.channels.cache.get(event.voiceChannelId);
            if (ch) await ch.delete("Evento Grupales finalizado");
        } catch (e) { logger.error(e); }
        activeEvents.delete(eventId);
        return interaction.update({ content: "🔒 Evento cerrado y canal eliminado.", embeds: [], components: [] });
    }

    const embed = buildUpdatedEmbed(event);
    interaction.update({ embeds: [embed] });
}

function buildUpdatedEmbed(event) {
    const list = Object.entries(event.roles)
        .map(([k, v]) => `${ROLES[k.toUpperCase()] || "➖"} **${k}:** ${v ? `<@${v}>` : "0/1"}`)
        .join("\n");

    return new EmbedBuilder()
        .setTitle("World of Albion")
        .setDescription(`**${event.titulo?.toUpperCase() || "Sin título"}**`)
        .setColor(0xFF6B6B)
        .addFields(
            { name: "Facción", value: `${event.faccion}`, inline: true },
            { name: "Hora", value: event.hora, inline: true },
            { name: "Creador", value: `<@${event.creatorId}>`, inline: true },
            { name: "Canal de Voz", value: `<#${event.canalVoz}>`, inline: true },
            { name: "Roles", value: list }
        )
        .setFooter({ text: "WOA • Grupo Zona Abierta" })
        .setTimestamp();
}