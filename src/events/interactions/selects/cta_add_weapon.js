import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { ctaDrafts } from "../modals/cta_handle.js";
import { WEAPONS_DICT } from "../../../utils/items.js";

const MAX_ROLES = 21;

export default async function (interaction) {
    if (interaction.customId !== "cta_add_weapon") return;

    const data = ctaDrafts.get(interaction.user.id);
    if (!data) {
        return interaction.reply({ content: "❌ No hay configuración activa.", flags: 64 });
    }

    if (data.roles.length >= MAX_ROLES) {
        return interaction.reply({ content: `❌ Máximo ${MAX_ROLES} roles permitidos.`, flags: 64 });
    }

    const value = interaction.values[0];
    const categoria = value.split('_')[0];
    const key = value.split('_')[1];
    
    const weaponInfo = WEAPONS_DICT[categoria]?.[key];
    if (!weaponInfo) {
        return interaction.reply({ content: "❌ Arma no encontrada.", flags: 64 });
    }

    // Verificar si ya existe
    if (data.roles.some(r => r.value === value)) {
        return interaction.reply({ content: "❌ Este rol ya está agregado.", flags: 64 });
    }

    // Agregar rol
    data.roles.push({
        label: weaponInfo.label,
        value: value,
        emoji: weaponInfo.emoji,
        categoria
    });

    // Crear embed actualizado
    const embed = interaction.message.embeds[0];
    const fields = embed.data.fields.filter(f => !f.name.includes("Selecciona:"));

    // Mostrar roles actuales
    const rolesText = data.roles.map((r, i) => `${r.emoji} **${i + 1}.** ${r.label}`).join("\n");
    fields.push({ name: "📋 Roles Configurados", value: rolesText || "Vacío", inline: false });

    // Actualizar select de armas
    const categoriasKeys = Object.keys(WEAPONS_DICT);
    const armasOptions = categoriasKeys.map(cat => ({ 
        label: cat, 
        value: cat,
        emoji: getCategoryEmoji(cat)
    }));

    const rowArmas = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("cta_add_category")
            .setPlaceholder("Añadir Categoría...")
            .addOptions(armasOptions)
    );

    await interaction.update({ 
        embeds: [{ ...embed.data, fields }], 
        components: [rowArmas, interaction.message.components[2]] 
    });
}

function getCategoryEmoji(cat) {
    const emojis = {
        SAGRADOS: "💚",
        GUANTES: "✨",
        FUEGO: "🔥",
        NATURAL: "🌿",
        MAZAS: "🛡️",
        MARTILLOS: "🔨",
        LANZAS: "🔱",
        HACHAS: "🪓",
        ESPADAS: "⚔️",
        HIELO: "❄️",
        DAGAS: "🗡️",
        CAMBIAFORMAS: "🐺",
        MALDICIONES: "💀",
        VARAS: "🪄",
        BALLESTAS: "🏹",
        ARCOS: "🎯",
        ARCANOS: "🔮"
    };
    return emojis[cat] || "⚔️";
}
