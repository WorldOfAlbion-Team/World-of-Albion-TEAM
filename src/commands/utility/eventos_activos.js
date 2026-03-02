import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { activeEvents } from "../../state/activeEvents.js";
import { COLORS } from "../../utils/colors.js";
import { GENERAL } from "../../constants/emojis.js";

export default {
    data: new SlashCommandBuilder()
        .setName("eventos_activos")
        .setDescription("Muestra todos los eventos activos en este servidor"),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guild.id;
        const todos = [...activeEvents.values()].filter(e => e.guildId === guildId);

        if (todos.length === 0) {
            return interaction.editReply({
                content: `📭 **No hay eventos activos** en este servidor ahora mismo.`
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${GENERAL.WOA} Eventos Activos — ${interaction.guild.name}`)
            .setColor(COLORS.albion)
            .setDescription(`> **${todos.length}** evento(s) en curso\n━━━━━━━━━━━━━━━━━━━━━━`)
            .setTimestamp();

        for (const e of todos) {
            const tipo = e.tipo || e.partyType || 'Evento';
            const caller = `<@${e.creatorId}>`;
            const voz = e.voiceChannelId ? `<#${e.voiceChannelId}>` : 'Sin canal';
            const hora = e.hora || '—';
            embed.addFields({
                name: `${tipo.toUpperCase()} — ${e.titulo || 'Sin título'}`,
                value: `👑 ${caller} · ⏰ ${hora} · 🔊 ${voz}`,
                inline: false
            });
        }

        embed.setFooter({ text: 'World of Albion • Eventos en vivo' });
        await interaction.editReply({ embeds: [embed] });
    }
};
