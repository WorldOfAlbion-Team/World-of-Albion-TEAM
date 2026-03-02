// src/commands/utility/server.js - Información del servidor de Albion Online
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { log } from '../../utils/logger.js';
import { COLORS } from '../../utils/colors.js';

export default {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Muestra información sobre los servidores de Albion Online')
        .setDescriptionLocalizations({
            'en-US': 'Shows information about Albion Online servers'
        })
        .addStringOption(option => 
            option
                .setName('region')
                .setDescription('Región del servidor')
                .addChoices(
                    { name: '🇪🇺 Europa', value: 'eu' },
                    { name: '🇺🇸 América del Norte', value: 'na' },
                    { name: '🌏 Asia', value: 'asia' },
                    { name: '🌍 Brazil', value: 'br' }
                )),

    async execute(interaction) {
        const region = interaction.options.getString('region') || 'eu';
        log.command('server', interaction.user.id, interaction.guildId);

        const servers = {
            eu: {
                name: '🇪🇺 Europa',
                status: '🟢 Online',
                ping: '~45ms',
                population: 'Alta',
                trueshard: 'West'
            },
            na: {
                name: '🇺🇸 América del Norte',
                status: '🟢 Online',
                ping: '~120ms',
                population: 'Media',
                trueshard: 'East'
            },
            asia: {
                name: '🌏 Asia',
                status: '🟡 Media',
                ping: '~200ms',
                population: 'Baja',
                trueshard: 'East'
            },
            br: {
                name: '🇧🇷 Brazil',
                status: '🟢 Online',
                ping: '~180ms',
                population: 'Media-Baja',
                trueshard: 'East'
            }
        };

        const server = servers[region];

        const embed = new EmbedBuilder()
            .setTitle(`🌍 Albion Online - ${server.name}`)
            .setColor(COLORS.albion)
            .setThumbnail('https://i.imgur.com/WOA_logo.png')
            .setDescription('Información del servidor seleccionada')
            .addFields(
                { name: '📊 Estado', value: server.status, inline: true },
                { name: '📡 Ping Estimado', value: server.ping, inline: true },
                { name: '👥 Población', value: server.population, inline: true },
                { name: '🌐 TrueShard', value: server.trueshard, inline: true },
                { name: '🔗 Enlace', value: '[Web Albion](https://albiononline.com)', inline: true }
            )
            .setFooter({ text: 'World of Albion • Sistema de Albion Online' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
