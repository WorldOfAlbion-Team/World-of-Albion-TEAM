// src/commands/partys/party_dorados.js
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
import { ROLES, GENERAL } from "../../constants/emojis.js";
import { activeEvents } from "../../state/activeEvents.js";
import { getGuildConfig } from "../../utils/guildConfig.js";

const EVENT_CONFIG = {
    name: "party_dorados",
    title: "DORADOS BERCILIEN",
    color: "Gold",
    roles: {
        tank: null,
        heal: null,
        flami: null,
        maldi: null,
        perfora1: null,
        perfora2: null,
        prisma: null
    },
    buttonPrefix: "dorados"
};

export default {
    data: new SlashCommandBuilder()
        .setName(EVENT_CONFIG.name)
        .setDescription("Crear un evento Dorados Bercilien")
        .addStringOption(o => o.setName("hora").setDescription("Hora del evento (Ej: 16:30)").setRequired(true))
        .addStringOption(o => o.setName("descripcion").setDescription("Descripción opcional del evento")),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const config = getGuildConfig("dorados", interaction.guild.id);
            if (!config) {
                return interaction.editReply({
                    content: "❌ Este servidor no ha configurado los canales para Dorados. Usa `/registrar_canales`."
                });
            }

            const hora = interaction.options.getString("hora");
            const descripcion = interaction.options.getString("descripcion") || null;

            const guild = interaction.guild;
            const voiceChannel = await guild.channels.create({
                name: `🔊 Dorados — ${interaction.user.username}`,
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
                hora,
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
            logger.error(`❌ Error en party_dorados: ${error.message}`);
            logger.error(error.stack);
            await interaction.editReply({ content: "❌ Error al crear evento" });
        }
    }
};

function createEventEmbed(event, cfg) {
    const list = Object.entries(event.roles)
        .map(([k, v]) => {
            const emoji = ROLES[k.toUpperCase()] || "➖";
            const roleName =
                k === "tank" ? "Tank" :
                k === "heal" ? "Heal" :
                k === "flami" ? "Flami" :
                k === "maldi" ? "Maldiciones" :
                k === "perfora1" ? "Perfora" :
                k === "perfora2" ? "Perfora" :
                k === "prisma" ? "DPS" : k.toUpperCase();
            return `${emoji} **${roleName}:** (${v ? `<@${v}>` : "0/1"})`;
        })
        .join("\n");

    return new EmbedBuilder()
        .setTitle(`<:WOA:1441970541517996114> World Of Albion <:WOA:1441970541517996114>`)
        .setDescription(`<:monedabank:1441970471800274995> **DORADOS BERCILIEN** <:monedabank:1441970471800274995>`)
        .setColor(cfg.color)
        .setThumbnail(event.creatorAvatar)
        .addFields(
            { name: "📢 CALLER", value: `<@${event.creatorId}>`, inline: true },
            { name: "🏷️ FACCION", value: `${event.faccion?.toUpperCase() || "SIN FACCION"}`, inline: true },
            { name: "🕒 FECHA", value: `<t:${event.createdAt}:D>`, inline: true },
            { name: "⏰ HORA", value: event.hora || "Sin hora", inline: true },
            { name: "📝 DESCRIPCIÓN OPCIONAL:", value: event.descripcion || "*Sin descripción*", inline: false },
            { name: "🛡️ ROLES", value: list || "Sin roles asignados", inline: false },
            { name: "🔊 CANAL DE VOZ", value: `<#${event.voiceChannelId}>`, inline: false }
        )
        .setFooter({
            text: `WOA team • Zona Abierta`
        })
        .setTimestamp();
}

function createEventComponents(eventId, cfg) {
    const select = new StringSelectMenuBuilder()
        .setCustomId(`dorados-select|${eventId}`)
        .setPlaceholder("Selecciona tu rol")
        .addOptions([
            { label: "Tank", value: "tank", emoji: ROLES.TANK },
            { label: "Heal", value: "heal", emoji: ROLES.HEAL },
            { label: "Flami", value: "flami", emoji: ROLES.FLAMI },
            { label: "Maldi", value: "maldi", emoji: ROLES.MALDI },
            { label: "Perfora 1", value: "perfora1", emoji: ROLES.PERFORA },
            { label: "Perfora 2", value: "perfora2", emoji: ROLES.PERFORA },
            { label: "DPS Prisma", value: "prisma", emoji: ROLES.DPS }
        ]);

    const row1 = new ActionRowBuilder().addComponents(select);

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`dorados-salir|${eventId}`)
            .setLabel("Salir")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`dorados-cerrar|${eventId}`)
            .setLabel("Cerrar evento")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger)
    );

    return [row1, row2];
}