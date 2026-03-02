import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { avaDrafts } from "../modals/ava_handle.js";
import { WEAPONS_DICT } from "../../../utils/items.js";

// Botón: Deshacer (AVA)
export default async function (interaction) {
    if (interaction.customId !== "ava_undo") return;

    const data = avaDrafts.get(interaction.user.id);
    if (!data) {
        return interaction.reply({ content: "❌ No hay borrador activo.", flags: 64 });
    }

    // Eliminar el último rol agregado
    if (data.rolesElegidos.length > 0) {
        data.rolesElegidos.pop();
    }

    const mitad = Math.ceil(data.rolesElegidos.length / 2);
    let colA = "", colB = "";

    data.rolesElegidos.forEach((rol, i) => {
        const linea = `**${i + 1}.** ${rol.emoji} ${rol.label} **(0/1)**\n`;
        if (i < mitad) colA += linea; else colB += linea;
    });

    const embedBorrador = new EmbedBuilder()
        .setTitle(`<:WOA:1441970541517996114> CONFIGURACIÓN: ${data.titulo.toUpperCase()}`)
        .setColor("#9b59b6")
        .setDescription(`📍 **Destino:** <#${data.canalId}>\nSelecciona los roles (Máx 50).`)
        .addFields(
            { name: "🛡️ Tier", value: data.tier, inline: true },
            { name: "📍 Lugar", value: data.lugar, inline: true },
            { name: "⏰ Hora", value: data.hora, inline: true }
        );

    if (data.descripcion.trim()) {
        embedBorrador.addFields({ name: "📝 Descripción", value: data.descripcion, inline: false });
    }

    if (data.rolesElegidos.length > 0) {
        embedBorrador.addFields(
            { name: "⚔️ COMPOSICIÓN", value: colA || "Vacío", inline: true }
        );
        if (colB.trim().length > 0) {
            embedBorrador.addFields({ name: "\u200B", value: colB, inline: true });
        }
    }

    const rowCategorias = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("ava_add_category")
            .setPlaceholder("Añadir Roles por Categoría...")
            .addOptions(Object.keys(WEAPONS_DICT).map(cat => ({ label: cat, value: cat })))
    );

    const rowBotones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("ava_publish")
            .setLabel("🚀 PUBLICAR")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId("ava_undo")
            .setLabel("⬅️ Deshacer")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("ava_cancel")
            .setLabel("Cancelar")
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.update({ embeds: [embedBorrador], components: [rowCategorias, rowBotones] });
};
