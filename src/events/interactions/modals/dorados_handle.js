// src/events/interactions/modals/dorados_handle.js
import { EmbedBuilder, MessageFlags } from "discord.js";
import { activeEvents } from "../../../state/activeEvents.js";
import { ROLES, GENERAL } from "../../../constants/emojis.js";
import { COLORS } from "../../../utils/colors.js";
import { FACCIONES } from "../../../constants/emojis.js";
import { log } from "../../../utils/logger.js";

const VALID_ROLES_DORADOS = ["tank", "heal", "flami", "maldi", "perfora1", "perfora2", "prisma"];

function buildList(roles) {
    return Object.entries(roles)
        .map(([k, v]) => `${ROLES[k.toUpperCase()] || "➖"} **${k.toUpperCase()}:** ${v ? `<@${v}>` : "*(vacío)*"}`)
        .join("\n");
}

function refreshEmbed(interaction, event, list) {
    return EmbedBuilder.from(interaction.message.embeds[0]).setFields(
        { name: "🛡️ COMPOSICIÓN", value: list || "*(Sin roles)*", inline: false }
    ).setDescription(
        `> 👑 **CALLER:** <@${event.creatorId}>\n` +
        `> ⏰ **HORA:** \`${event.hora}\`\n` +
        `> 🔊 **VOZ:** <#${event.voiceChannelId}>\n` +
        `> 📝 **NOTA:** ${event.descripcion}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━`
    );
}

export default async function (interaction) {
    if (!interaction.customId.startsWith("dorados-")) return;

    const parts = interaction.customId.split("|");
    const action = parts[0].replace("-modal", "");
    const eventId = parts[1];
    const event = activeEvents.get(eventId);

    if (!event) return interaction.reply({ content: "❌ Evento no encontrado.", flags: MessageFlags.Ephemeral });

    const rawId = interaction.fields.getTextInputValue("user_id").replace(/[<@!>]/g, "").replace(/\D/g, "");

    if (action === "dorados-agregar") {
        const roleName = interaction.fields.getTextInputValue("role_name").toLowerCase().trim();
        if (!VALID_ROLES_DORADOS.includes(roleName)) {
            return interaction.reply({
                content: `❌ Rol inválido: \`${roleName}\`\nRoles válidos: ${VALID_ROLES_DORADOS.join(", ")}`,
                flags: MessageFlags.Ephemeral
            });
        }
        if (event.roles[roleName]) {
            return interaction.reply({
                content: `❌ El rol **${roleName}** ya está ocupado por <@${event.roles[roleName]}>`,
                flags: MessageFlags.Ephemeral
            });
        }
        event.roles[roleName] = rawId;
        log.interaction('modal', 'dorados-agregar');
        return interaction.update({ embeds: [refreshEmbed(interaction, event, buildList(event.roles))] });
    }

    if (action === "dorados-quitar") {
        let removed = false;
        for (const rol in event.roles) {
            if (event.roles[rol] === rawId) { event.roles[rol] = null; removed = true; }
        }
        if (!removed) return interaction.reply({ content: "❌ El usuario no está inscrito en esta party.", flags: MessageFlags.Ephemeral });
        log.interaction('modal', 'dorados-quitar');
        return interaction.update({ embeds: [refreshEmbed(interaction, event, buildList(event.roles))] });
    }
}
