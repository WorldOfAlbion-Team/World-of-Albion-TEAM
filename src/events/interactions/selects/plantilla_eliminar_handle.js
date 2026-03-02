import { EmbedBuilder } from "discord.js";
import { deleteTemplate, getTemplateById } from "../../../database.js";

export default async function (interaction) {
    if (interaction.customId !== "select_eliminar_plantilla") return;

    const id = parseInt(interaction.values[0]);
    const template = await getTemplateById(id);

    if (!template) {
        return interaction.update({ 
            content: "❌ Plantilla no encontrada.", 
            components: [] 
        });
    }

    await deleteTemplate(id);

    const embed = new EmbedBuilder()
        .setTitle("🗑️ Plantilla Eliminada")
        .setColor("#e74c3c")
        .setDescription(`La plantilla **${template.name}** ha sido eliminada.`)
        .addFields(
            { name: "📝 Nombre", value: template.name, inline: true },
            { name: "🛡️ Tier", value: template.tier, inline: true }
        )
        .setTimestamp();

    await interaction.update({ embeds: [embed], components: [] });
};
