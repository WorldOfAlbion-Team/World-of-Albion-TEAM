// src/events/interactions/modals/plantilla_handle.js
import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { createTemplate, getAllTemplates } from "../../../database.js";
import { WEAPONS_DICT } from "../../../utils/items.js";
import { GENERAL } from "../../../constants/emojis.js";
import { COLORS } from "../../../utils/colors.js";
import { log } from "../../../utils/logger.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("modal_plantilla_")) return;

    // customId: modal_plantilla_NOMBRE__TIPO
    const raw = interaction.customId.replace("modal_plantilla_", "");
    const [nombre, tipo] = raw.split("__");

    const titulo  = interaction.fields.getTextInputValue("titulo");
    // tier y lugar ahora vienen en un único campo separado por '|'
    const tierLugarRaw = interaction.fields.getTextInputValue("tier_lugar") || "";
    const [tier, lugar] = tierLugarRaw.split("|").map(s => s.trim());
    const hora    = interaction.fields.getTextInputValue("hora");
    const canalId = interaction.fields.getTextInputValue("canal_id").trim();

    // Verificar que el canal existe
    const canal = await interaction.guild.channels.fetch(canalId).catch(() => null);
    if (!canal) {
        return interaction.reply({
            content: `❌ No encontré el canal con ID \`${canalId}\`. Verifica el ID e intenta de nuevo.`,
            flags: MessageFlags.Ephemeral
        });
    }

    // Crear la plantilla en DB (sin roles aún — se agregan al usar)
    try {
        await createTemplate(
            interaction.guildId, nombre, tipo,
            titulo, tier, lugar, hora, "", [], canalId
        );
    } catch (e) {
        if (e.message?.includes("unique")) {
            return interaction.reply({
                content: `❌ Ya existe una plantilla con el nombre **"${nombre}"**. Usa un nombre diferente.`,
                flags: MessageFlags.Ephemeral
            });
        }
        throw e;
    }

    const embed = new EmbedBuilder()
        .setTitle(`${GENERAL.WOA} Plantilla creada`)
        .setColor(COLORS.success)
        .setDescription(`> La plantilla **${nombre}** fue guardada exitosamente`)
        .addFields(
            { name: "📝 Título",  value: titulo,          inline: true },
            { name: "🛡️ Tier",   value: `\`${tier}\``,   inline: true },
            { name: "📍 Lugar",  value: lugar,            inline: true },
            { name: "⏰ Hora",   value: `\`${hora}\``,   inline: true },
            { name: "📢 Canal",  value: `<#${canalId}>`,  inline: true },
            { name: "🏷️ Tipo",   value: tipo,            inline: true }
        )
        .setFooter({ text: `Usa /plantilla_usar para publicar • World of Albion` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    log.interaction('modal', 'plantilla_crear');
}
