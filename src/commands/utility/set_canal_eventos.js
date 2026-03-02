import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { setGuildChannel } from "../../database.js";

export default {
  data: new SlashCommandBuilder()
    .setName("set_canal_eventos")
    .setDescription("Define el canal oficial donde el bot publicará eventos")
    .addChannelOption(option =>
      option
        .setName("canal")
        .setDescription("Canal de texto para eventos")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    ,

  async execute(interaction) {
    const canal = interaction.options.getChannel("canal");

    await setGuildChannel(interaction.guild.id, canal.id);

    await interaction.reply({
      content: `📢 **Canal de eventos configurado:** ${canal}`,
      flags: 64,
    });
  },
};
