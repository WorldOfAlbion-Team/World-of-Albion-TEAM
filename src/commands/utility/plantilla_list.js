import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getAllTemplates } from "../../database.js";
import { GENERAL } from "../../constants/emojis.js";
import { COLORS } from "../../utils/colors.js";

export default {
    data: new SlashCommandBuilder()
        .setName("plantilla_list")
        .setDescription("Lista todas las plantillas disponibles en este servidor"),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const templates = await getAllTemplates(interaction.guildId);

        if (templates.length === 0) {
            return interaction.editReply({
                content: "📭 No hay plantillas creadas. Usa `/plantilla_crear` para empezar."
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${GENERAL.WOA} Plantillas del servidor`)
            .setColor(COLORS.primary)
            .setDescription(`> **${templates.length}** plantilla(s) disponibles\n━━━━━━━━━━━━━━━━━━━━━━`)
            .setFooter({ text: "Usa /plantilla_usar <nombre> para publicar • World of Albion" })
            .setTimestamp();

        for (const t of templates) {
            const icon = t.tipo === "buff" ? "🔮" : t.tipo === "completa" ? "⚔️" : "🎮";
            embed.addFields({
                name: `${icon} ${t.name}`,
                value: `> 🛡️ Tier: \`${t.tier}\` · 📍 ${t.lugar} · ⏰ \`${t.hora}\`\n> 📢 <#${t.canal_id}>`,
                inline: false
            });
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
