import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { allowRole } from "../../database.js";

export default {
  data: new SlashCommandBuilder()
    .setName("allow_role")
    .setDescription("Autoriza un rol para usar los comandos del bot")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que podrá usar el bot")
        .setRequired(true)
    )
    ,

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    await allowRole(interaction.guild.id, rol.id);

    await interaction.reply({
      content: `✅ **Rol autorizado:** ${rol}`,
      flags: 64,
    });
  },
};
