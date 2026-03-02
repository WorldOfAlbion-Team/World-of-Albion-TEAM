import { SlashCommandBuilder } from "discord.js";
import { getAllowedRoles } from "../../database.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list_roles")
    .setDescription("Lista los roles autorizados para usar el bot"),

  async execute(interaction) {
    const rolesIds = await getAllowedRoles(interaction.guild.id);

    if (!rolesIds.length) {
      return interaction.reply({
        content: "📭 No hay roles autorizados en este servidor.",
        flags: 64,
      });
    }

    const roles = rolesIds
      .map(id => `<@&${id}>`)
      .join("\n");

    await interaction.reply({
      content: `🎭 **Roles autorizados:**\n${roles}`,
      flags: 64,
    });
  },
};
