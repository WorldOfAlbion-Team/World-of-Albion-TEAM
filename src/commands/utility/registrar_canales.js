import {
  SlashCommandBuilder,
  ChannelType
} from "discord.js";
import { setEventChannelConfig } from "../../database.js";

export default {
  data: new SlashCommandBuilder()
    .setName("registrar_canales")
    .setDescription("Registrar canales para eventos")
    .addSubcommand(sc =>
      sc
        .setName("dorados")
        .setDescription("Registrar canales para DORADOS")
        .addChannelOption(opt =>
          opt
            .setName("canal_embed")
            .setDescription("Canal donde se enviarán los embeds")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addChannelOption(opt =>
          opt
            .setName("categoria_voz")
            .setDescription("Categoría para canales de voz")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory)
        )
    )
    .addSubcommand(sc =>
      sc
        .setName("grupales")
        .setDescription("Registrar canales para GRUPALES")
        .addChannelOption(opt =>
          opt
            .setName("canal_embed")
            .setDescription("Canal donde se enviarán los embeds")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addChannelOption(opt =>
          opt
            .setName("categoria_voz")
            .setDescription("Categoría para canales de voz")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory)
        )
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    const embedChannel = interaction.options.getChannel("canal_embed");
    const voiceCategory = interaction.options.getChannel("categoria_voz");

    await setEventChannelConfig(
      guildId,
      sub, // ← dorados | grupales FIJO
      embedChannel.id,
      voiceCategory.id
    );

    return interaction.reply({
      content:
        `✅ **Configuración guardada**\n\n` +
        `🎯 Evento: **${sub.toUpperCase()}**\n` +
        `📢 Canal embeds: <#${embedChannel.id}>\n` +
        `🔊 Categoría voz: **${voiceCategory.name}**`,
      flags: 64
    });
  }
};
