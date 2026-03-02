import { EmbedBuilder, MessageFlags } from "discord.js";
import { activeEvents } from "../../../state/activeEvents.js";
import { ROLES, GENERAL } from "../../../constants/emojis.js";
import { COLORS } from "../../../utils/colors.js";
import { log } from "../../../utils/logger.js";

export default async function (interaction) {
    const [, eventId] = interaction.customId.split("|");
    const event = activeEvents.get(eventId);

    if (!event) return interaction.reply({ content: "❌ Evento no encontrado o ya finalizado.", flags: MessageFlags.Ephemeral });

    const selected = interaction.values[0];
    const userId = interaction.user.id;

    // Liberar rol previo del usuario
    for (const r in event.roles) {
        if (event.roles[r] === userId) event.roles[r] = null;
    }

    // Verificar disponibilidad
    if (event.roles[selected]) {
        return interaction.reply({ content: `❌ El rol **${selected.toUpperCase()}** ya está ocupado por <@${event.roles[selected]}>.`, flags: MessageFlags.Ephemeral });
    }

    event.roles[selected] = userId;

    const list = Object.entries(event.roles)
        .map(([k, v]) => `${ROLES[k.toUpperCase()] || "➖"} **${k.toUpperCase()}:** ${v ? `<@${v}>` : "*(vacío)*"}`)
        .join("\n");

    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setFields({ name: "🛡️ COMPOSICIÓN", value: list, inline: false })
        .setDescription(
            `> 👑 **CALLER:** <@${event.creatorId}>\n` +
            `> ⏰ **HORA:** \`${event.hora}\`\n` +
            `> 🔊 **VOZ:** <#${event.voiceChannelId}>\n` +
            `> 📝 **NOTA:** ${event.descripcion}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━`
        );

    log.interaction('select', `dorados-select-${selected}`);
    await interaction.update({ embeds: [updatedEmbed] });
}
