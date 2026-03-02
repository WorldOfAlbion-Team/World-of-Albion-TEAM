import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { ctaDrafts } from "../modals/cta_handle.js";
import { WEAPONS_DICT } from "../../../utils/items.js";

export default async function (interaction) {
    if (interaction.customId !== "cta_add_category") return;

    const data = ctaDrafts.get(interaction.user.id);
    if (!data) {
        return interaction.reply({ content: "❌ No hay configuración activa.", flags: 64 });
    }

    const categoria = interaction.values[0];
    const opciones = Object.entries(WEAPONS_DICT[categoria] || {}).slice(0, 25).map(([key, info]) => ({
        label: info.label,
        value: `${categoria}_${key}`,
        emoji: info.emoji
    }))

    // Crear embed actualizado
    const embed = interaction.message.embeds[0];
    const fields = [...embed.data.fields];

    // Mostrar armas disponibles
    fields.push({ 
        name: `🎯 Selecciona: ${categoria}`, 
        value: opciones.slice(0, 10).map(o => `${o.emoji} ${o.label}`).join("\n") || "Vacío",
        inline: false 
    });

    // Actualizar el selector de armas
    const newRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("cta_add_weapon")
            .setPlaceholder(`Selecciona arma de ${categoria}...`)
            .addOptions(opciones)
    );

    const rows = interaction.message.components.map(r => {
        if (r.components[0]?.customId === "cta_add_weapon") {
            return newRow;
        }
        return r;
    });

    await interaction.update({ embeds: [{ ...embed.data, fields }], components: rows });
}
