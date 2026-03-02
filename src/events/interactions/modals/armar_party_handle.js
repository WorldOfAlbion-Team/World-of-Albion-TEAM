import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { WEAPONS_DICT } from "../../../utils/items.js";
import { log } from "../../../utils/logger.js";

// Estado temporal para almacenar configuración de parties
const partyConfigs = new Map();
const partyDrafts = new Map();

// Categorías con emojis
const CATEGORIAS = {
    caller: { emoji: "📢", name: "CALLER" },
    tank: { emoji: "🛡️", name: "TANK" },
    dps: { emoji: "⚔️", name: "DPS" },
    heal: { emoji: "💚", name: "HEAL" },
    support: { emoji: "✨", name: "SUPPORT" },
    stopper: { emoji: "🛑", name: "STOPPER" }
};

// Todas las armas disponibles
const ARMAS_DISPONIBLES = Object.keys(WEAPONS_DICT);

export default async function (interaction) {
    if (interaction.customId !== "modal_armar_party_basico") return;

    const titulo = interaction.fields.getTextInputValue("titulo");
    
    // Parsear campos combinados
    const canalTierRaw = interaction.fields.getTextInputValue("canal_tier");
    const canalId = canalTierRaw.split("|")[0]?.replace(/\D/g, "").trim() || "";
    const tier = canalTierRaw.split("|")[1]?.trim() || "N/A";
    
    const categoriasRaw = interaction.fields.getTextInputValue("categorias");
    const categoriasSeleccionadas = categoriasRaw.split(",").map(c => c.trim().toLowerCase()).filter(c => c && (CATEGORIAS[c] || c === 'stopper'));
    
    const lugarHoraRaw = interaction.fields.getTextInputValue("lugar_hora");
    const lugar = lugarHoraRaw.split("|")[0]?.trim() || "";
    const hora = lugarHoraRaw.split("|")[1]?.trim() || "";

    if (categoriasSeleccionadas.length === 0) {
        return interaction.reply({ 
            content: "❌ Debes especificar al menos una categoría válida (caller, tank, dps, heal, support, stopper).", 
            flags: 64 
        });
    }

    // Guardar configuración temporalmente
    const configId = `${interaction.guildId}_${interaction.user.id}_${Date.now()}`;
    const config = {
        titulo,
        canalId,
        categorias: categoriasSeleccionadas,
        tier,
        lugar,
        hora,
        creatorId: interaction.user.id,
        participantes: new Map()
    };
    partyConfigs.set(configId, config);

    // Crear embed de configuración
    const categoriasTexto = categoriasSeleccionadas
        .map(cat => `${CATEGORIAS[cat]?.emoji || "•"} ${CATEGORIAS[cat]?.name || cat}`)
        .join("\n");

    const embed = new EmbedBuilder()
        .setTitle(`⚙️ CONFIGURANDO: ${titulo}`)
        .setColor("#f1c40f")
        .setDescription("Configura las armas para cada categoría de tu party")
        .addFields(
            { name: "📍 Canal", value: `<#${canalId}>`, inline: true },
            { name: "🛡️ Tier", value: tier, inline: true },
            { name: "📍 Lugar", value: lugar, inline: true },
            { name: "⏰ Hora", value: hora, inline: true },
            { name: "📋 Categorías", value: categoriasTexto, inline: false }
        );

    // Crear selectores de armas para cada categoría (máximo 5 ActionRows = 5 selectores)
    const rows = [];
    
    // Tomar solo las primeras 5 categorías para selectores
    const categoriasParaSelect = categoriasSeleccionadas.slice(0, 5);
    
    for (const cat of categoriasParaSelect) {
        const catInfo = CATEGORIAS[cat];
        
        const selectArmas = new StringSelectMenuBuilder()
            .setCustomId(`arma_${cat}_${configId}`)
            .setPlaceholder(`Arma para ${catInfo?.name || cat}...`)
            .addOptions([
                { label: "Sin arma específica", value: "ninguna", emoji: "❌" },
                ...ARMAS_DISPONIBLES.slice(0, 24).map(arma => ({
                    label: arma,
                    value: `${arma}|${cat}`,
                    emoji: getWeaponEmoji(arma)
                }))
            ]);

        rows.push(new ActionRowBuilder().addComponents(selectArmas));
    }

    // Si hay más de 5 categorías, mostrar en texto
    if (categoriasSeleccionadas.length > 5) {
        const categoriasRestantes = categoriasSeleccionadas.slice(5)
            .map(cat => `${CATEGORIAS[cat]?.emoji || "•"} ${CATEGORIAS[cat]?.name || cat}`)
            .join(", ");
        embed.addFields({ name: "📋 Categorías adicionales", value: categoriasRestantes, inline: false });
    }

    // Botones para publicar, guardar plantilla o cancelar
    const rowBotones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`party_agregar_miembro_${configId}`)
            .setLabel("➕ Agregar Miembro")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`party_guardar_plantilla_${configId}`)
            .setLabel("💾 Guardar Plantilla")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`party_publicar_${configId}`)
            .setLabel("🚀 PUBLICAR")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`party_cancel_${configId}`)
            .setLabel("❌ Cancelar")
            .setStyle(ButtonStyle.Danger)
    );

    rows.push(rowBotones);

    await interaction.reply({ 
        embeds: [embed], 
        components: rows, 
        flags: 64 
    });
}

function getWeaponEmoji(categoria) {
    const emojis = {
        "Sagrados": "✨",
        "Guantes": "🧤",
        "Fuego": "🔥",
        "Natural": "🌿",
        "Mazas": "🔨",
        "Martillos": "🔨",
        "Lanzas": "🔱",
        "Hachas": "🪓",
        "Espadas": "⚔️",
        "Hielo": "❄️",
        "Dagas": "🗡️",
        "Cambiaformas": "🐺",
        "Maldiciones": "💀",
        "Varas": "🪄",
        "Ballestas": "🏹",
        "Arcos": "🏹",
        "Arcanos": "🔮"
    };
    return emojis[categoria] || "⚔️";
}

// Exportar para usar en botones
export { partyConfigs, partyDrafts, CATEGORIAS };
