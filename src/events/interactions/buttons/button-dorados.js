// src/events/interactions/buttons/button-dorados.js
import { EmbedBuilder } from "discord.js";
import { activeEvents } from "../../../state/activeEvents.js";
import { logger } from "../../../utils/logger.js";
import { ROLES } from "../../../constants/emojis.js";

export default async function (interaction) {
    logger.info(`[button-dorados] customId recibido: ${interaction.customId}`);
    const [prefixRaw, eventId] = interaction.customId.split("|");
    const action = prefixRaw.replace("dorados-", ""); // "salir" o "cerrar"

    logger.info(`[button-dorados] ¿eventId existe? ${activeEvents.has(eventId)}`);
    logger.info(`[button-dorados] total eventos en Map: ${activeEvents.size}`);

    const event = activeEvents.get(eventId);
    if (!event) {
        logger.error(`[button-dorados] eventId "${eventId}" no encontrado`);
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
            if (ch) await ch.delete("Evento Dorados finalizado");
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
        .setTitle("<:WOA:1441970541517996114> DORADOS BERCILIEN <:WOA:1441970541517996114>")
        .setDescription(event.descripcion || "Sin descripción")
        .setColor("Gold")
        .addFields(
            { name: "⏰ Hora", value: event.hora, inline: true },
            { name: "🛡️ Roles", value: list }
        )
        .setFooter({ text: "WOA • Sistema Dorados" })
        .setTimestamp();
}