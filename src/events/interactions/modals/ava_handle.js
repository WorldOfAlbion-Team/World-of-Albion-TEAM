// src/events/interactions/modals/ava_handle.js - Modal para AVA
import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { WEAPONS_DICT } from "../../../utils/items.js";
import { parseCombinedField } from "../../../utils/embeder.js";

export const avaDrafts = new Map();

export default async function (interaction) {
    if (interaction.customId !== "modal_ava") return;

    const canalTierRaw = interaction.fields.getTextInputValue("canal_tier");
    const canalId = parseCombinedField(canalTierRaw, 0).replace(/\D/g, "");
    const tier = parseCombinedField(canalTierRaw, 1) || "N/A";

    const lugarTiempoRaw = interaction.fields.getTextInputValue("lugar_tiempo");
    const lugar = parseCombinedField(lugarTiempoRaw, 0);
    const hora = parseCombinedField(lugarTiempoRaw, 1);

    const titulo = interaction.fields.getTextInputValue("titulo");
    const descripcion = interaction.fields.getTextInputValue("descripcion") || "";

    const data = { titulo, canalId, tier, lugar, hora, descripcion, rolesElegidos: [], tipo: titulo.toUpperCase().includes("BUFF") ? "buff" : "completa" };
    avaDrafts.set(interaction.user.id, data);

    const embed = new EmbedBuilder()
        .setTitle(`<:WOA:1441970541517996114> CONFIGURACIÓN: ${titulo.toUpperCase()}`)
        .setColor("#9b59b6")
        .setDescription(`📍 **Destino:** <#${canalId}>\nSelecciona los roles (Mín 2 - Máx 21).`)
        .addFields(
            { name: "🛡️ Tier", value: tier, inline: true },
            { name: "📍 Lugar", value: lugar, inline: true },
            { name: "⏰ Hora", value: hora, inline: true }
        );

    if (descripcion.trim()) embed.addFields({ name: "📝 Descripción", value: descripcion, inline: false });

    const rowCategorias = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("ava_add_category")
            .setPlaceholder("Añadir Roles por Categoría...")
            .addOptions(Object.keys(WEAPONS_DICT).slice(0, 25).map(cat => ({ label: cat, value: cat })))
    );

    const rowBotones = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("ava_publish").setLabel("🚀 PUBLICAR").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("ava_undo").setLabel("⬅️ Deshacer").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("ava_cancel").setLabel("Cancelar").setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [rowCategorias, rowBotones], flags: 64 });
};
