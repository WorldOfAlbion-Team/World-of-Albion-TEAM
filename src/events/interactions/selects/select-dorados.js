// src/events/interactions/selects/select-dorados.js
import { EmbedBuilder } from "discord.js";
import { activeEvents } from "../../../state/activeEvents.js";
import { ROLES } from "../../../constants/emojis.js";
import { logger } from "../../../utils/logger.js";

export default async function (interaction) {
    const [prefix, eventId] = interaction.customId.split("|");
    const event = activeEvents.get(eventId);
    if (!event) {
        logger.error(`[select-dorados] eventId "${eventId}" no encontrado`);
        return interaction.reply({ content: "❌ Evento no encontrado.", flags: [64] });
    }

    const selected = interaction.values[0];

    // Liberar rol anterior
    for (const r in event.roles) if (event.roles[r] === interaction.user.id) event.roles[r] = null;
    if (event.roles[selected]) return interaction.reply({ content: "❌ Rol ya ocupado.", flags: [64] });

    event.roles[selected] = interaction.user.id;
    event.participantes.set(interaction.user.id, selected);

    const embed = new EmbedBuilder()
        .setTitle(`<:WOA:1441970541517996114> World Of Albion <:WOA:1441970541517996114>`)
        .setDescription(`<:monedabank:1441970471800274995> **DORADOS BERCILIEN** <:monedabank:1441970471800274995>`)
        .setColor("Gold")
        .addFields(
            { name: "📢 CALLER", value: `<@${event.creatorId}>`, inline: true },
            { name: "🏷️ FACCION", value: `${event.faccion?.toUpperCase() || "SIN FACCION"}`, inline: true },
            { name: "🕒 FECHA", value: `<t:${event.createdAt}:D>`, inline: true },
            { name: "⏰ HORA", value: event.hora || "Sin hora", inline: true },
            { name: "📝 DESCRIPCIÓN OPCIONAL:", value: event.descripcion || "*Sin descripción*", inline: false },
            {
                name: "🛡️ ROLES",
                value: Object.entries(event.roles)
                    .map(([k, v]) => {
                        const emoji = ROLES[k.toUpperCase()] || "➖";
                        const roleName =
                            k === "tank" ? "Tank" :
                            k === "heal" ? "Heal" :
                            k === "flami" ? "Flami" :
                            k === "maldi" ? "Maldiciones" :
                            k === "perfora1" ? "Perfora" :
                            k === "perfora2" ? "Perfora" :
                            k === "prisma" ? "DPS" : k.toUpperCase();
                        return `${emoji} **${roleName}:** (${v ? `<@${v}>` : "0/1"})`;
                    })
                    .join("\n"),
                inline: false
            },
            { name: "🔊 CANAL DE VOZ", value: `<#${event.voiceChannelId}>`, inline: false }
        )
        .setFooter({ text: `WOA team • Zona Abierta` })
        .setTimestamp();

    await interaction.update({ embeds: [embed] });
}