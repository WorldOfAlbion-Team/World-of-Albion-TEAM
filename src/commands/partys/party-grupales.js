// src/commands/partys/party_grupales.js
import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} from "discord.js";
import crypto from "crypto";
import { logger } from "../../utils/logger.js";
import { ROLES, GENERAL, FACCIONES } from "../../constants/emojis.js";
import { activeEvents } from "../../state/activeEvents.js";
import { getGuildConfig } from "../../utils/guildConfig.js";

const EVENT_CONFIG = {
    name: "party_grupales",
    title: "ZONA ABIERTA",
    color: 0xFF6B6B,
    roles: {
        tank: null,
        heal: null,
        flami: null,
        sc: null,
        badon: null,
        dps: null
    },
    buttonPrefix: "grupales"
};

export default {
    data: new SlashCommandBuilder()
        .setName(EVENT_CONFIG.name)
        .setDescription("Crear un evento para Zona Abierta (ZA/ZR/ZN)")
        .addStringOption(o => o.setName("titulo").setDescription("Título del evento (ZA, ZR o ZN)").setRequired(true))
        .addStringOption(o => o.setName("hora").setDescription("Hora del evento (Ej: 17:30)").setRequired(true))
        .addStringOption(o => o.setName("faccion").setDescription("Facción").setRequired(true)
            .addChoices(
                { name: "Martlock", value: "martlock" },
                { name: "Thetford", value: "thetford" },
                { name: "Fort Sterling", value: "fortsterling" },
                { name: "Lymhurst", value: "lymhurst" },
                { name: "Bridgewatch", value: "bridgewatch" },
                { name: "Caerleon", value: "caerleon" }
            ))
        .addStringOption(o => o.setName("descripcion").setDescription("Descripción opcional del evento")),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const config = getGuildConfig("grupales", interaction.guild.id);
            if (!config) {
                return interaction.editReply({
                    content: "❌ Este servidor no ha configurado los canales para Grupales. Usa `/registrar_canales`."
                });
            }

            const titulo = interaction.options.getString("titulo");
            const hora = interaction.options.getString("hora");
            const faccion = interaction.options.getString("faccion");
            const descripcion = interaction.options.getString("descripcion") || null;

            const guild = interaction.guild;
            const voiceChannel = await guild.channels.create({
                name: `🔊 ${titulo.toUpperCase()} — ${interaction.user.username}`,
                type: ChannelType.GuildVoice,
                parent: config.categoriaVozId
            });

            const eventId = crypto.randomUUID();
            const createdAt = Math.floor(Date.now() / 1000);

            const eventData = {
                eventId,
                creatorId: interaction.user.id,
                creatorName: interaction.user.displayName,
                creatorAvatar: interaction.user.displayAvatarURL({ dynamic: true }),
                titulo,
                hora,
                faccion,
                descripcion,
                canalVoz: voiceChannel.id,
                voiceChannelId: voiceChannel.id,
                roles: { ...EVENT_CONFIG.roles },
                participantes: new Map(),
                createdAt
            };

            activeEvents.set(eventId, eventData);

            const embed = createEventEmbed(eventData, EVENT_CONFIG);
            const components = createEventComponents(eventId, EVENT_CONFIG);

            const canalEmbeds = await interaction.client.channels.fetch(config.canalEmbedId);
            await canalEmbeds.send({ content: "@everyone", embeds: [embed], components });

            await interaction.editReply({
                content: `✅ Evento **${EVENT_CONFIG.title}** creado en ${canalEmbeds} y canal de voz creado: ${voiceChannel}`
            });

        } catch (error) {
            logger.error(`❌ Error en party_grupales: ${error.message}`);
            logger.error(error.stack);
            await interaction.editReply({ content: "❌ Error al crear evento" });
        }
    }
};

function getFaccionEmoji(faccion) {
    const emojis = {
        martlock: FACCIONES.MARTLOCK,
        thetford: FACCIONES.THETFORD,
        fortsterling: FACCIONES.FORT_STERLING,
        lymhurst: FACCIONES.LYMHURST,
        bridgewatch: FACCIONES.BRIDGEWATCH,
        caerleon: FACCIONES.CAERLEON
    };
    return emojis[faccion] || "";
}

function createEventEmbed(event, cfg) {
    const list = Object.entries(event.roles)
        .map(([k, v]) => {
            const emoji = ROLES[k.toUpperCase()] || "➖";
            const roleName = k === "dps" ? "DPS (opcional)" : k.toUpperCase();
            return `${emoji} **${roleName}:** (${v ? `<@${v}>` : "0/1"})`;
        })
        .join("\n");

    return new EmbedBuilder()
        .setTitle(`<:WOA:1441970541517996114> World Of Albion <:WOA:1441970541517996114>`)
        .setDescription(`**${event.titulo?.toUpperCase() || "SIN TÍTULO"}**`)
        .setColor(cfg.color)
        .setThumbnail(event.creatorAvatar)
        .addFields(
            { name: "📢 CALLER", value: `<@${event.creatorId}>`, inline: true },
            { name: "🏷️ FACCION", value: `${getFaccionEmoji(event.faccion)} ${event.faccion?.toUpperCase()}`, inline: true },
            { name: "🕒 FECHA", value: `<t:${event.createdAt}:D>`, inline: true },
            { name: "⏰ HORA", value: event.hora || "Sin hora", inline: true },
            { name: "📝 DESCRIPCIÓN OPCIONAL:", value: event.descripcion || "*Sin descripción*", inline: false },
            { name: "🛡️ ROLES", value: list || "Sin roles asignados", inline: false },
            { name: "🔊 CANAL DE VOZ", value: `<#${event.voiceChannelId}>`, inline: false }
        )
        .setFooter({
            text: `WOA team • Zona Abierta `
        })
        .setTimestamp();
}

function createEventComponents(eventId, cfg) {
    const select = new StringSelectMenuBuilder()
        .setCustomId(`grupales-select|${eventId}`)
        .setPlaceholder("Selecciona tu rol")
        .addOptions([
            { label: "Tank", value: "tank", emoji: ROLES.TANK },
            { label: "Heal", value: "heal", emoji: ROLES.HEAL },
            { label: "Flami", value: "flami", emoji: ROLES.FLAMI },
            { label: "Sc", value: "sc", emoji: ROLES.SC },
            { label: "Badon", value: "badon", emoji: ROLES.BADON },
            { label: "DPS", value: "dps", emoji: ROLES.DPS }
        ]);

    const row1 = new ActionRowBuilder().addComponents(select);

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`grupales-salir|${eventId}`)
            .setLabel("Salir")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`grupales-cerrar|${eventId}`)
            .setLabel("Cerrar evento")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger)
    );

    return [row1, row2];
}