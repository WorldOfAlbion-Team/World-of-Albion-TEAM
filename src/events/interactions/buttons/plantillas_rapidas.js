import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getTemplateById } from "../../../database.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("plantillas_rapidas_select")) return;

    const valorSeleccionado = interaction.values[0];

    if (valorSeleccionado === "cancelar") {
        return interaction.update({
            content: "❌ Selección cancelada.",
            embeds: [],
            components: [],
            flags: 64
        });
    }

    const templateId = parseInt(valorSeleccionado);
    const template = await getTemplateById(templateId);

    if (!template) {
        return interaction.update({
            content: "❌ Plantilla no encontrada.",
            embeds: [],
            components: [],
            flags: 64
        });
    }

    // Crear embed con detalles de la plantilla
    const embed = new EmbedBuilder()
        .setTitle(`📋 Plantilla: ${template.name}`)
        .setColor("#9b59b6")
        .addFields(
            { name: "🎯 Tipo", value: template.tipo.toUpperCase(), inline: true },
            { name: "🛡️ Tier", value: template.tier, inline: true },
            { name: "📍 Lugar", value: template.lugar, inline: true },
            { name: "⏰ Hora", value: template.hora, inline: true }
        );

    // Mostrar roles/categorías
    const rolesData = template.roles_data || [];
    if (rolesData.length > 0) {
        const rolesList = rolesData.map((r, i) => `${r.emoji || "⚔️"} **${r.label}**`).join("\n");
        embed.addFields({ name: "👥 Roles/Categorías", value: rolesList, inline: false });
    }

    if (template.descripcion?.trim()) {
        embed.addFields({ name: "📝 Descripción", value: template.descripcion, inline: false });
    }

    embed.setFooter({ text: "Selecciona una opción abajo para usar esta plantilla" });

    // Crear botones de acción
    const rowBotones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`usar_plantilla_${template.id}`)
            .setLabel("🚀 Usar Plantilla")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`editar_plantilla_${template.id}`)
            .setLabel("✏️ Editar")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`eliminar_plantilla_${template.id}`)
            .setLabel("🗑️ Eliminar")
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.update({
        embeds: [embed],
        components: [rowBotones]
    });
}
