// src/commands/partys/party_dorados.js
import {
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
    StringSelectMenuBuilder, ButtonBuilder, ButtonStyle,
    ChannelType, MessageFlags
} from "discord.js";
import crypto from "crypto";
import { ROLES, GENERAL } from "../../constants/emojis.js";
import { activeEvents } from "../../state/activeEvents.js";
import { getEventChannelConfig } from "../../database.js";
import { log } from "../../utils/logger.js";
import { COLORS } from "../../utils/colors.js";

export default {
    data: new SlashCommandBuilder()
        .setName("party_dorados")
        .setDescription("Crear evento — Dorados Brecilien")
        .addStringOption(o => o.setName("hora").setDescription("Hora del evento (Ej: 20:00)").setRequired(true))
        .addStringOption(o => o.setName("descripcion").setDescription("Descripción o notas del evento (opcional)")),

    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const config = await getEventChannelConfig(interaction.guild.id, "dorados");
            if (!config) return interaction.editReply({
                content: "❌ Canal no configurado. Un admin debe usar `/registrar_canales dorados` primero."
            });

            const hora = interaction.options.getString("hora");
            const descripcion = interaction.options.getString("descripcion") || "*Sin descripción*";
            const creador = interaction.user;

            const voiceChannel = await interaction.guild.channels.create({
                name: `🎮 Dorados — ${creador.username}`,
                type: ChannelType.GuildVoice,
                parent: config.voice_category_id
            });

            const eventId = crypto.randomUUID();
            const eventData = {
                eventId,
                guildId: interaction.guild.id,
                creatorId: creador.id,
                creatorAvatar: creador.displayAvatarURL({ dynamic: true }),
                titulo: "DORADOS BRECILIEN",
                tipo: "dorados",
                hora,
                descripcion,
                voiceChannelId: voiceChannel.id,
                roles: { tank: null, heal: null, flami: null, maldi: null, perfora1: null, perfora2: null, prisma: null },
                createdAt: Math.floor(Date.now() / 1000)
            };

            activeEvents.set(eventId, eventData);

            const canal = await interaction.client.channels.fetch(config.embed_channel_id);
            const msg = await canal.send({
                content: "@everyone",
                embeds: [buildEmbed(eventData)],
                components: buildComponents(eventId)
            });

            const confirmEmbed = new EmbedBuilder()
                .setColor(COLORS.success)
                .setTitle("✅ Evento publicado")
                .setDescription(`Tu evento **DORADOS BRECILIEN** está listo`)
                .addFields(
                    { name: "📍 Canal", value: `<#${config.embed_channel_id}>`, inline: true },
                    { name: "🔊 Voz",   value: voiceChannel.toString(), inline: true },
                    { name: "⏰ Hora",  value: `\`${hora}\``, inline: true }
                )
                .setFooter({ text: "World of Albion • Dorados Brecilien" })
                .setTimestamp();

            await interaction.editReply({ embeds: [confirmEmbed] });
            log.command('party_dorados', creador.id, interaction.guild.id);
        } catch (err) {
            log.error("party_dorados", err);
            await interaction.editReply({ content: "❌ Error al crear el evento. Verifica los permisos del bot." });
        }
    }
};

function buildEmbed(e) {
    const list = Object.entries(e.roles)
        .map(([k, v]) => `${ROLES[k.toUpperCase()] || "➖"} **${k.toUpperCase()}:** ${v ? `<@${v}>` : "*(vacío)*"}`)
        .join("\n");

    return new EmbedBuilder()
        .setTitle(`${GENERAL.WOA} DORADOS BRECILIEN`)
        .setColor(COLORS.dorados)
        .setThumbnail(e.creatorAvatar)
        .setDescription(
            `> 👑 **CALLER:** <@${e.creatorId}>\n` +
            `> ⏰ **HORA:** \`${e.hora}\`\n` +
            `> 🔊 **VOZ:** <#${e.voiceChannelId}>\n` +
            `> 📝 **NOTA:** ${e.descripcion}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━`
        )
        .addFields({ name: "🛡️ COMPOSICIÓN", value: list, inline: false })
        .setFooter({ text: "Usa el menú para inscribirte • World of Albion" })
        .setTimestamp();
}

function buildComponents(eventId) {
    const select = new StringSelectMenuBuilder()
        .setCustomId(`dorados-select|${eventId}`)
        .setPlaceholder("🎮 Selecciona tu rol para unirte")
        .addOptions([
            { label: "Tank",       value: "tank",    emoji: ROLES.TANK },
            { label: "Heal",       value: "heal",    emoji: ROLES.HEAL },
            { label: "Flami",      value: "flami",   emoji: ROLES.FLAMI },
            { label: "Maldi",      value: "maldi",   emoji: ROLES.MALDI },
            { label: "Perfora 1",  value: "perfora1",emoji: ROLES.PERFORA },
            { label: "Perfora 2",  value: "perfora2",emoji: ROLES.PERFORA },
            { label: "DPS Prisma", value: "prisma",  emoji: ROLES.PRISMA },
        ]);

    return [
        new ActionRowBuilder().addComponents(select),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`dorados-agregar|${eventId}`).setLabel("➕ Agregar").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`dorados-quitar|${eventId}`).setLabel("➖ Quitar").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`dorados-salir|${eventId}`).setLabel("Salir").setStyle(ButtonStyle.Secondary).setEmoji("❌"),
            new ButtonBuilder().setCustomId(`dorados-cerrar|${eventId}`).setLabel("Cerrar").setStyle(ButtonStyle.Danger).setEmoji("🔒")
        )
    ];
}
