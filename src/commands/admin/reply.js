import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

const OWNER_ID = "1074466114811215882"; 

export default {
    data: new SlashCommandBuilder()
        .setName("reply")
        .setDescription("Responder a un usuario vía MD")
        .addStringOption(o => o.setName("usuario_id").setDescription("ID del usuario").setRequired(true))
        .addStringOption(o => o.setName("mensaje").setDescription("Contenido del mensaje").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ Acceso denegado.", flags: 64 });
        }

        const userId = interaction.options.getString("usuario_id");
        const contenido = interaction.options.getString("mensaje");

        try {
            const user = await interaction.client.users.fetch(userId);
            await user.send({ content: `👋 **Mensaje de WOA Dev:**\n\n${contenido}` });
            await interaction.reply({ content: `✅ Enviado a **${user.tag}**.`, flags: 64 });
        } catch (error) {
            await interaction.reply({ content: "❌ No pude enviar el MD (posiblemente bloqueado).", flags: 64 });
        }
    },
};