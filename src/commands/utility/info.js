import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { log } from '../../utils/logger.js';
import { GENERAL } from '../../constants/emojis.js';
import { COLORS } from '../../utils/colors.js';

export default {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Información del bot y del servidor')
        .addSubcommand(s => s.setName('bot').setDescription('Información y estado del bot'))
        .addSubcommand(s => s.setName('server').setDescription('Información del servidor de Discord')),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        log.command('info', interaction.user.id, interaction.guildId);
        const sub = interaction.options.getSubcommand();
        if (sub === 'bot') return this.botInfo(interaction);
        if (sub === 'server') return this.serverInfo(interaction);
    },

    async botInfo(interaction) {
        const client = interaction.client;
        const uptimeSecs = process.uptime();
        const d = Math.floor(uptimeSecs / 86400);
        const h = Math.floor((uptimeSecs % 86400) / 3600);
        const m = Math.floor((uptimeSecs % 3600) / 60);

        const embed = new EmbedBuilder()
            .setTitle(`${GENERAL.WOA} World Of Albion — Bot Info`)
            .setColor(COLORS.albion)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setDescription('> Bot especializado para comunidades de **Albion Online** en español')
            .addFields(
                { name: '🤖 Nombre',     value: `\`${client.user.username}\``,                                          inline: true },
                { name: '🏓 WebSocket',  value: `\`${client.ws.ping}ms\``,                                              inline: true },
                { name: '💾 Memoria',    value: `\`${Math.round(process.memoryUsage().heapUsed/1024/1024)}MB\``,         inline: true },
                { name: '⏱️ Uptime',     value: `\`${d}d ${h}h ${m}m\``,                                               inline: true },
                { name: '🌐 Servidores', value: `\`${client.guilds.cache.size}\``,                                      inline: true },
                { name: '📚 Comandos',   value: `\`${client.commands.size}\``,                                          inline: true }
            )
            .setFooter({ text: 'World of Albion • Bot Info' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    async serverInfo(interaction) {
        const g = interaction.guild;
        const embed = new EmbedBuilder()
            .setTitle(`${GENERAL.WOA} ${g.name}`)
            .setColor(COLORS.info)
            .setThumbnail(g.iconURL({ dynamic: true }))
            .setDescription('> Información del servidor de Discord')
            .addFields(
                { name: '👑 Owner',      value: `<@${g.ownerId}>`,                                   inline: true },
                { name: '👥 Miembros',   value: `\`${g.memberCount}\``,                              inline: true },
                { name: '💬 Canales',    value: `\`${g.channels.cache.size}\``,                      inline: true },
                { name: '🎭 Roles',      value: `\`${g.roles.cache.size}\``,                         inline: true },
                { name: '😀 Emojis',     value: `\`${g.emojis.cache.size}\``,                        inline: true },
                { name: '📅 Creado',     value: `<t:${Math.floor(g.createdTimestamp/1000)}:R>`,      inline: true }
            )
            .setFooter({ text: 'World of Albion • Server Info' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
