import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { addGuildToWhitelist } from "../../database.js";
import { OWNER_ID } from "../../config.js";
import { log } from "../../utils/logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("whitelist_add")
    .setDescription("SOLO OWNER: Autoriza un servidor por ID")
    .addStringOption(option =>
      option
        .setName("guild_id")
        .setDescription("ID del servidor de Discord")
        .setRequired(true)
    ),

  async execute(interaction) {
    // 🔐 SOLO OWNER
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ No eres el dueño.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const guildId = interaction.options.getString("guild_id");

    // 🧪 VALIDACIÓN BÁSICA DEL ID
    if (!/^\d{17,20}$/.test(guildId)) {
      return interaction.reply({
        content: "❌ El ID del servidor no es válido.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      // 💾 GUARDAR EN LA TABLA guilds
      await addGuildToWhitelist(guildId);

      return interaction.reply({
        content: `✅ Servidor **${guildId}** añadido correctamente a la whitelist.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      log.error("Error en whitelist_add:", error);

      return interaction.reply({
        content: `❌ Error al guardar en la base de datos:\n\`${error.message}\``,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
