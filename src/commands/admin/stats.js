import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import pool from "../../database.js";
import { OWNER_ID } from "../../config.js";
import { GENERAL } from "../../constants/emojis.js";
import { COLORS } from "../../utils/colors.js";

export default {
    data: new SlashCommandBuilder()
        .setName("stats_global")
        .setDescription("Estadísticas globales del bot (Solo Owner)"),

    async execute(interaction) {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ Solo el Owner puede usar este comando.", flags: 64 });
        }

        await interaction.deferReply({ ephemeral: true });

        const guildCount = interaction.client.guilds.cache.size;
        const res = await pool.query("SELECT COUNT(*) FROM guilds WHERE whitelisted = true");
        const whitelistCount = parseInt(res.rows[0].count);

        const embed = new EmbedBuilder()
            .setTitle(`${GENERAL.WOA} Estadísticas Globales`)
            .setColor(COLORS.albion)
            .setDescription('> Panel de control del desarrollador')
            .addFields(
                { name: "🌐 Servidores totales",   value: `\`${guildCount}\``,        inline: true },
                { name: "✅ En whitelist",          value: `\`${whitelistCount}\``,    inline: true },
                { name: "👥 Usuarios en caché",    value: `\`${interaction.client.users.cache.size}\``, inline: true },
                { name: "💾 Memoria",              value: `\`${Math.round(process.memoryUsage().heapUsed/1024/1024)}MB\``, inline: true },
                { name: "📡 WebSocket",            value: `\`${interaction.client.ws.ping}ms\``, inline: true }
            )
            .setFooter({ text: `World of Albion • Owner Panel` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
