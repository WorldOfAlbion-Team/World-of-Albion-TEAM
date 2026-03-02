import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } from "discord.js";
import { getPartyEventByMessageId, addPartyParticipant, removePartyParticipant, getPartyParticipants } from "../../../database.js";
import { WEAPONS_DICT } from "../../../utils/items.js";
import { log } from "../../../utils/logger.js";
import { validateVoiceChannel } from "../../../utils/voiceChannelValidator.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("unirse_party_")) return;

    const eventId = interaction.customId.replace("unirse_party_", "");
    const selectedValue = interaction.values[0];

    // Si quiere salir
    if (selectedValue === "salir_party") {
        await handleSalir(interaction, eventId);
        return;
    }

    // Parsear categoría seleccionada
    const [, categoria] = selectedValue.split("unirse_");

    const event = await getPartyEventByMessageId(eventId);
    if (!event) {
        return interaction.reply({ 
            content: "❌ Evento no encontrado.", 
            flags: 64 
        });
    }

    // Validar canal de voz (si existe)
    if (event.voice_channel_id && !await validateVoiceChannel(interaction, event.voice_channel_id)) {
        return;
    }

    // Verificar si ya está registrado
    const participants = await getPartyParticipants(event.id);
    const existing = participants.find(p => p.user_id === interaction.user.id);

    if (existing) {
        return interaction.reply({ 
            content: "❌ Ya estás registrado en esta party. Usa el botón de salir para cambiar.", 
            flags: 64 
        });
    }

    // Obtener armas disponibles
    const categoriasArmas = Object.keys(WEAPONS_DICT);

    // Crear select de armas
    const selectArmas = new StringSelectMenuBuilder()
        .setCustomId(`seleccionar_arma_${eventId}_${interaction.user.id}`)
        .setPlaceholder("Selecciona tu arma...")
        .addOptions([
            { label: "Sin arma específica", value: "ninguna", emoji: "❌" },
            ...categoriasArmas.map(cat => ({
                label: cat,
                value: `${cat}_${categoria}`,
                emoji: getWeaponEmoji(cat)
            }))
        ]);

    const row = new ActionRowBuilder().addComponents(selectArmas);

    // Guardar categoría temporalmente
    interaction.client.pendingPartyJoin = {
        eventId,
        categoria,
        userId: interaction.user.id
    };

    await interaction.reply({
        content: `Seleccionaste **${categoria.toUpperCase()}**. Ahora selecciona tu arma:`,
        components: [row],
        flags: 64
    });
};

async function handleSalir(interaction, eventId) {
    const event = await getPartyEventByMessageId(eventId);
    if (!event) {
        return interaction.reply({ 
            content: "❌ Evento no encontrado.", 
            flags: 64 
        });
    }

    const participants = await getPartyParticipants(event.id);
    const existing = participants.find(p => p.user_id === interaction.user.id);

    if (!existing) {
        return interaction.reply({ 
            content: "❌ No estás en esta party.", 
            flags: 64 
        });
    }

    await removePartyParticipant(event.id, interaction.user.id);

    // Quitar permisos del canal de voz
    if (event.voice_channel_id) {
        try {
            const voiceChannel = await interaction.guild.channels.fetch(event.voice_channel_id);
            if (voiceChannel) {
                await voiceChannel.permissionOverwrites.delete(interaction.user.id);
            }
        } catch (e) {
            log.error("Error quitando permisos:", e);
        }
    }

    await interaction.reply({ 
        content: "✅ Has salido de la party.", 
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
        "Vara": "🪄",
        "Ballestas": "🏹",
        "Arcos": "🏹",
        "Arcanos": "🔮"
    };
    return emojis[categoria] || "⚔️";
}
