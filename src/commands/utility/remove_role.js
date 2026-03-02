import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { removeRole } from "../../database.js";

export default {
  data: new SlashCommandBuilder()
    .setName("remove_role")
    .setDescription("Quita un rol autorizado del bot")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol a quitar")
        .setRequired(true)
    )
    ,

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    await removeRole(interaction.guild.id, rol.id);

    await interaction.reply({
      content: `❌ **Rol removido:** ${rol}`,
      flags: 64,
    });
  },
};
