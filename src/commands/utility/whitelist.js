import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Gestiona la whitelist del servidor")
    .addSubcommand(sc =>
      sc.setName("add").setDescription("Añade este servidor a la whitelist")
    )
    .addSubcommand(sc =>
      sc.setName("remove").setDescription("Elimina este servidor de la whitelist")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const cmd = interaction.client.commands.get(`whitelist_${sub}`);

    if (!cmd) {
      return interaction.reply({
        content: "❌ Subcomando no encontrado.",
        flags: 64
      });
    }

    return cmd.execute(interaction);
  }
};
