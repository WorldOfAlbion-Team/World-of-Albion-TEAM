import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } from "discord.js";
import { WEAPONS_DICT } from "../../../utils/items.js";

// Categorías con emojis
const CATEGORIES = [
    { label: "🛡️ TANKS", value: "TANKS", emoji: "🛡️" },
    { label: "💚 HEALS", value: "HEALS", emoji: "💚" },
    { label: "✨ SUPPORTS", value: "SUPPORTS", emoji: "✨" },
    { label: "⚔️ DPS", value: "DPS", emoji: "⚔️" }
];

// Emojis por rol
const ROLE_EMOJIS = {
    TANKS: "🛡️",
    HEALS: "💚",
    SUPPORTS: "✨",
    DPS: "⚔️"
};

// Mapear categoría de weapon a tipo
const CATEGORY_TYPES = {
    SAGRADOS: "HEALS",
    GUANTES: "SUPPORTS",
    FUEGO: "DPS",
    NATURAL: "DPS",
    MAZAS: "TANKS",
    MARTILLOS: "TANKS",
    LANZAS: "TANKS",
    HACHAS: "TANKS",
    ESPADAS: "TANKS",
    HIELO: "DPS",
    DAGAS: "DPS",
    CAMBIAFORMAS: "DPS",
    MALDICIONES: "DPS",
    VARAS: "DPS",
    BALLESTAS: "DPS",
    ARCOS: "DPS",
    ARCANOS: "DPS"
};

// Almacenar drafts de CTA
export const ctaDrafts = new Map();

export default async function (interaction) {
    if (interaction.customId !== "modal_cta") return;

    const canalId = interaction.fields.getTextInputValue("canal_id").replace(/\D/g, "");
    const descripcion = interaction.fields.getTextInputValue("descripcion") || "";

    // Obtener datos del comando usando user.id como clave
    const commandData = interaction.client.ctaDataMap?.get(interaction.user.id);

    if (!commandData) {
        return interaction.reply({ content: "❌ Error: No se encontraron los datos del CTA.", flags: 64 });
    }

    const { titulo, lugar, hora } = commandData;

    // Guardar draft
    const data = {
        titulo,
        lugar,
        hora,
        descripcion,
        canalId,
        roles: [],
        participants: [],
        createdBy: interaction.user.id
    };

    ctaDrafts.set(interaction.user.id, data);

    // Crear embed del draft
    const embed = new EmbedBuilder()
        .setTitle(`🎯 CONFIGURACIÓN: ${titulo.toUpperCase()}`)
        .setColor("#e74c3c")
        .setDescription(`📍 **Destino:** <#${canalId}>\n👑 **Creador:** <@${interaction.user.id}>`)
        .addFields(
            { name: "📍 Lugar", value: lugar, inline: true },
            { name: "⏰ Hora", value: hora, inline: true }
        );

    if (descripcion.trim()) {
        embed.addFields({ name: "📝 Descripción", value: descripcion });
    }

    // Selector de categoría
    const rowCategoria = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("cta_add_category")
            .setPlaceholder("Añadir Categoría...")
            .addOptions(CATEGORIES)
    );

    // Selector de armas (dependiendo de la categoría)
    const categoriasKeys = Object.keys(WEAPONS_DICT);
    const rowArmas = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("cta_add_weapon")
            .setPlaceholder("Añadir Arma/Rol...")
            .addOptions(categoriasKeys.map(cat => ({ label: cat, value: cat })))
    );

    // Botones
    const rowBotones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("cta_publish")
            .setLabel("🚀 PUBLICAR")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId("cta_undo")
            .setLabel("⬅️ Deshacer")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("cta_cancel")
            .setLabel("Cancelar")
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [rowCategoria, rowArmas, rowBotones], flags: 64 });
}
