import { EmbedBuilder, MessageFlags } from "discord.js";
import { updateTemplate, getTemplateById } from "../../../database.js";
import { GENERAL } from "../../../constants/emojis.js";
import { COLORS } from "../../../utils/colors.js";
import { log } from "../../../utils/logger.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("modal_editar_")) return;

    const id = parseInt(interaction.customId.replace("modal_editar_", ""));
    const t = await getTemplateById(id);
    if (!t) return interaction.reply({ content: "❌ Plantilla no encontrada.", flags: MessageFlags.Ephemeral });

    const titulo  = interaction.fields.getTextInputValue("titulo");
    const tier    = interaction.fields.getTextInputValue("tier");
    const lugar   = interaction.fields.getTextInputValue("lugar");
    const hora    = interaction.fields.getTextInputValue("hora");
    const canalId = interaction.fields.getTextInputValue("canal_id").trim();

    const canal = await interaction.guild.channels.fetch(canalId).catch(() => null);
    if (!canal) {
        return interaction.reply({
            content: `❌ Canal con ID \`${canalId}\` no encontrado.`,
            flags: MessageFlags.Ephemeral
        });
    }

    await updateTemplate(id, titulo, tier, lugar, hora, t.descripcion || "", t.roles_data || [], canalId);

    const embed = new EmbedBuilder()
        .setTitle(`${GENERAL.WOA} Plantilla actualizada`)
        .setColor(COLORS.success)
        .setDescription(`> Los cambios de **${t.name}** fueron guardados`)
        .addFields(
            { name: "📝 Título", value: titulo,         inline: true },
            { name: "🛡️ Tier",  value: `\`${tier}\``,  inline: true },
            { name: "📍 Lugar", value: lugar,            inline: true },
            { name: "⏰ Hora",  value: `\`${hora}\``,   inline: true },
            { name: "📢 Canal", value: `<#${canalId}>`,  inline: true }
        )
        .setFooter({ text: "World of Albion • Plantillas" })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    log.interaction('modal', 'plantilla_editar');
}
