// src/commands/partys/party_grupales.js
import {
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
    StringSelectMenuBuilder, ButtonBuilder, ButtonStyle,
    ChannelType, MessageFlags
} from "discord.js";
import crypto from "crypto";
import { ROLES, FACCIONES, GENERAL } from "../../constants/emojis.js";
import { activeEvents } from "../../state/activeEvents.js";
import { getEventChannelConfig } from "../../database.js";
import { log } from "../../utils/logger.js";
import { COLORS } from "../../utils/colors.js";

export default {
    data: new SlashCommandBuilder()
        .setName("party_grupales")
        .setDescription("Crear evento — Zona Abierta / Grupales")
        .addStringOption(o => o.setName("titulo").setDescription("Tipo de evento (ZA, ZR, GvG...)").setRequired(true))
        .addStringOption(o => o.setName("hora").setDescription("Hora del evento (Ej: 20:00)").setRequired(true))
        .addStringOption(o => o.setName("faccion").setDescription("Facción del evento").setRequired(true)
            .addChoices(
                { name: "Martlock",      value: "MARTLOCK" },
                { name: "Thetford",      value: "THETFORD" },
                { name: "Fort Sterling", value: "FORT_STERLING" },
                { name: "Lymhurst",      value: "LYMHURST" },
                { name: "Bridgewatch",   value: "BRIDGEWATCH" },
                { name: "Caerleon",      value: "CAERLEON" }
            ))
        .addStringOption(o => o.setName("descripcion").setDescription("Descripción o notas (opcional)")),

    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const config = await getEventChannelConfig(interaction.guild.id, "grupales");
            if (!config) return interaction.editReply({
                content: "❌ Canal no configurado. Un admin debe usar `/registrar_canales grupales` primero."
            });

            const titulo    = interaction.options.getString("titulo");
            const hora      = interaction.options.getString("hora");
            const faccion   = interaction.options.getString("faccion");
            const descripcion = interaction.options.getString("descripcion") || "*Sin descripción*";
            const creador   = interaction.user;

            const voiceChannel = await interaction.guild.channels.create({
                name: `🌍 ${titulo.toUpperCase()} — ${creador.username}`,
                type: ChannelType.GuildVoice,
                parent: config.voice_category_id
            });

            const eventId = crypto.randomUUID();
            const eventData = {
                eventId,
                guildId: interaction.guild.id,
                creatorId: creador.id,
                creatorAvatar: creador.displayAvatarURL({ dynamic: true }),
                titulo: titulo.toUpperCase(),
                tipo: "grupales",
                hora,
                faccion,
                descripcion,
                voiceChannelId: voiceChannel.id,
                roles: { tank: null, heal: null, flami: null, sc: null, badon: null, dps: null },
                createdAt: Math.floor(Date.now() / 1000)
            };

            activeEvents.set(eventId, eventData);

            const canal = await interaction.client.channels.fetch(config.embed_channel_id);
            await canal.send({
                content: "@everyone",
                embeds: [buildEmbed(eventData)],
                components: buildComponents(eventId)
            });

            const confirmEmbed = new EmbedBuilder()
                .setColor(COLORS.success)
                .setTitle("✅ Evento publicado")
                .setDescription(`Tu evento **${titulo.toUpperCase()}** está listo`)
                .addFields(
                    { name: "📍 Canal",  value: `<#${config.embed_channel_id}>`, inline: true },
                    { name: "🔊 Voz",    value: voiceChannel.toString(), inline: true },
                    { name: "⏰ Hora",   value: `\`${hora}\``, inline: true },
                    { name: "🏳️ Facción", value: `${FACCIONES[faccion]} ${faccion}`, inline: true }
                )
                .setFooter({ text: "World of Albion • Zona Abierta" })
                .setTimestamp();

            await interaction.editReply({ embeds: [confirmEmbed] });
            log.command('party_grupales', creador.id, interaction.guild.id);
        } catch (err) {
            log.error("party_grupales", err);
            await interaction.editReply({ content: "❌ Error al crear el evento. Verifica los permisos del bot." });
        }
    }
};

function buildEmbed(e) {
    const facEmoji = FACCIONES[e.faccion] || "";
    const list = Object.entries(e.roles)
        .map(([k, v]) => `${ROLES[k.toUpperCase()] || "➖"} **${k.toUpperCase()}:** ${v ? `<@${v}>` : "*(vacío)*"}`)
        .join("\n");

    return new EmbedBuilder()
        .setTitle(`${GENERAL.WOA} ${e.titulo}`)
        .setColor(COLORS.grupales)
        .setThumbnail(e.creatorAvatar)
        .setDescription(
            `> 👑 **CALLER:** <@${e.creatorId}>\n` +
            `> ${facEmoji} **FACCIÓN:** ${e.faccion}\n` +
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
        .setCustomId(`grupales-select|${eventId}`)
        .setPlaceholder("🌍 Selecciona tu rol para unirte")
        .addOptions([
            { label: "Tank",  value: "tank",  emoji: ROLES.TANK },
            { label: "Heal",  value: "heal",  emoji: ROLES.HEAL },
            { label: "Flami", value: "flami", emoji: ROLES.FLAMI },
            { label: "SC",    value: "sc",    emoji: ROLES.SC },
            { label: "Badón", value: "badon", emoji: ROLES.BADON },
            { label: "DPS",   value: "dps",   emoji: ROLES.DPS },
        ]);

    return [
        new ActionRowBuilder().addComponents(select),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`grupales-agregar|${eventId}`).setLabel("➕ Agregar").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`grupales-quitar|${eventId}`).setLabel("➖ Quitar").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`grupales-salir|${eventId}`).setLabel("Salir").setStyle(ButtonStyle.Secondary).setEmoji("❌"),
            new ButtonBuilder().setCustomId(`grupales-cerrar|${eventId}`).setLabel("Cerrar").setStyle(ButtonStyle.Danger).setEmoji("🔒")
        )
    ];
}
