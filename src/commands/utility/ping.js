import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { log } from '../../utils/logger.js';
import { GENERAL } from '../../constants/emojis.js';
import { COLORS } from '../../utils/colors.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Verifica el estado del bot y su latencia'),

    async execute(interaction) {
        log.command('ping', interaction.user.id, interaction.guildId);
        await interaction.deferReply({ ephemeral: true });

        const ws = interaction.client.ws.ping;
        const api = Math.abs(Date.now() - interaction.createdTimestamp);
        const estado = ws < 100 ? '🟢 Excelente' : ws < 250 ? '🟡 Buena' : '🔴 Alta';

        const embed = new EmbedBuilder()
            .setTitle(`${GENERAL.WOA} World Of Albion — Sistema`)
            .setColor(ws < 100 ? COLORS.success : ws < 250 ? COLORS.warning : COLORS.error)
            .setDescription('> Estado actual de los sistemas del bot')
            .addFields(
                { name: '📡 Latencia API',       value: `\`${api}ms\``,   inline: true },
                { name: '🌐 WebSocket',          value: `\`${ws}ms\``,    inline: true },
                { name: '📊 Estado',             value: estado,            inline: true },
                { name: '🤖 Servidores',         value: `\`${interaction.client.guilds.cache.size}\``, inline: true },
                { name: '💾 Memoria',            value: `\`${Math.round(process.memoryUsage().heapUsed/1024/1024)}MB\``, inline: true },
                { name: '⏱️ Uptime',             value: `<t:${Math.floor((Date.now() - process.uptime()*1000)/1000)}:R>`, inline: true }
            )
            .setFooter({ text: 'World of Albion • Bot Status' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
