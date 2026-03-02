import {
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
    StringSelectMenuBuilder, ButtonBuilder, ButtonStyle,
    ChannelType, MessageFlags
} from "discord.js";
import { getTemplate, getAllTemplates } from "../../database.js";
import { GENERAL } from "../../constants/emojis.js";
import { COLORS } from "../../utils/colors.js";

export default {
    data: new SlashCommandBuilder()
        .setName("plantilla_usar")
        .setDescription("Publica un evento usando una plantilla guardada")
        .addStringOption(o => o.setName("nombre").setDescription("Nombre de la plantilla").setRequired(true).setAutocomplete(true))
        .addStringOption(o => o.setName("hora").setDescription("Hora del evento (sobreescribe la plantilla, opcional)"))
        .addStringOption(o => o.setName("descripcion").setDescription("Descripción o nota extra (opcional)")),

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        const templates = await getAllTemplates(interaction.guildId);
        const filtered = templates
            .filter(t => t.name.toLowerCase().includes(focused))
            .slice(0, 25)
            .map(t => ({ name: `${t.name} — Tier ${t.tier} | ${t.lugar}`, value: t.name }));
        await interaction.respond(filtered);
    },

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const nombre = interaction.options.getString("nombre");
        const horaOverride = interaction.options.getString("hora");
        const descOverride = interaction.options.getString("descripcion");

        const t = await getTemplate(interaction.guildId, nombre);
        if (!t) return interaction.editReply({ content: `❌ No existe plantilla **"${nombre}"**.` });

        const canal = await interaction.guild.channels.fetch(t.canal_id).catch(() => null);
        if (!canal) return interaction.editReply({ content: `❌ Canal \`${t.canal_id}\` no encontrado. Edita la plantilla.` });

        const hora = horaOverride || t.hora;
        const descripcion = descOverride || t.descripcion || "*Sin descripción*";

        // Crear canal de voz
        let voiceChannel = null;
        try {
            voiceChannel = await interaction.guild.channels.create({
                name: `🔊 ${t.titulo}`,
                type: ChannelType.GuildVoice,
                parent: canal.parentId
            });
        } catch { /* sin permisos de voz, continuar */ }

        const rolesData = t.roles_data || [];
        const rolesList = rolesData.length > 0
            ? rolesData.map((r, i) => `${r.emoji || "⚔️"} **${r.label}** **(0/1)**`).join("\n")
            : "*Esta plantilla no tiene roles configurados aún*";

        const embed = new EmbedBuilder()
            .setTitle(`${GENERAL.WOA} ${t.titulo.toUpperCase()}`)
            .setColor(COLORS.primary)
            .setDescription(
                `> 👑 **LÍDER:** <@${interaction.user.id}>\n` +
                `> 🛡️ **TIER:** \`${t.tier}\`\n` +
                `> 📍 **LUGAR:** ${t.lugar}\n` +
                `> ⏰ **HORA:** \`${hora}\`\n` +
                (voiceChannel ? `> 🔊 **VOZ:** <#${voiceChannel.id}>\n` : '') +
                (descripcion !== "*Sin descripción*" ? `> 📝 **NOTA:** ${descripcion}\n` : '') +
                `━━━━━━━━━━━━━━━━━━━━━━`
            )
            .addFields({ name: "📋 COMPOSICIÓN", value: rolesList, inline: false })
            .setFooter({ text: `Plantilla: ${t.name} • World of Albion` })
            .setTimestamp();

        const btnCerrar = new ButtonBuilder()
            .setCustomId("ava_cerrar")
            .setLabel("Cerrar Party")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🔒");

        await canal.send({ content: "@everyone", embeds: [embed], components: [new ActionRowBuilder().addComponents(btnCerrar)] });

        const ok = new EmbedBuilder()
            .setColor(COLORS.success)
            .setDescription(`✅ Evento publicado en <#${t.canal_id}> usando plantilla **${nombre}**`);

        await interaction.editReply({ embeds: [ok] });
    }
};
