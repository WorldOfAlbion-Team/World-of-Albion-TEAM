import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { purgeGuildData } from "../../database.js";
import { OWNER_ID } from "../../config.js";

export default {
    data: new SlashCommandBuilder()
        .setName("whitelist_remove")
        .setDescription("SOLO OWNER: Borra un servidor de raíz")
        .addStringOption(option => 
            option.setName("guild_id")
                .setDescription("El ID del servidor a eliminar")
                .setRequired(true)), // ESTO CREA LA CAJITA DE TEXTO

    async execute(interaction) {
        // PROTECCIÓN DUEÑO
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ No eres el dueño.", flags: MessageFlags.Ephemeral });
        }

        const guildId = interaction.options.getString("guild_id");

        try {
            await purgeGuildData(guildId);
            return interaction.reply({ 
                content: `✅ Servidor **${guildId}** y toda su configuración borrados.`, 
                flags: MessageFlags.Ephemeral 
            });
        } catch (error) {
            return interaction.reply({ content: "❌ Error al eliminar.", flags: MessageFlags.Ephemeral });
        }
    }
};