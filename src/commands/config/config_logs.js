import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from "discord.js";
import { setLogChannel } from "../../database.js";

export default {
    data: new SlashCommandBuilder()
        .setName("config_logs")
        .setDescription("Canal para reportes de partys")
        .addChannelOption(o => o.setName("canal").setDescription("Canal de texto").setRequired(true).addChannelTypes(ChannelType.GuildText))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const canal = interaction.options.getChannel("canal");
        await setLogChannel(interaction.guild.id, canal.id);
        await interaction.reply({ content: `✅ Reportes configurados en ${canal}`, flags: 64 });
    }
};