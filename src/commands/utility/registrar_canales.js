// src/commands/utility/registrar_canales.js
import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from "discord.js";
import { logger } from "../../utils/logger.js";
import { setGuildConfig } from "../../utils/guildConfig.js";

// 🔧 Tipos de eventos soportados
const TIPOS = [
    "dorados", "grupales", "hce", "ava", "buffo",
    "cta", "gank", "rastreo", "guerra de facciones", "antiquarium", "arenas", "wb"
];

export default {
    data: new SlashCommandBuilder()
        .setName("registrar_canales")
        .setDescription("Configura canal de embeds y categoría de voz para cada tipo de evento")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(opt =>
            opt.setName("tipo")
                .setDescription("Tipo de evento")
                .setRequired(true)
                .addChoices(...TIPOS.map(t => ({ name: t.toUpperCase(), value: t })))
        )
        .addChannelOption(opt =>
            opt.setName("canal_embed")
                .setDescription("Canal donde se enviará el embed")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addChannelOption(opt =>
            opt.setName("categoria_voz")
                .setDescription("Categoría donde se crearán los canales de voz")
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            // ✅ 1. Obtener valores
            const tipo = interaction.options.getString("tipo");
            const canalEmbed = interaction.options.getChannel("canal_embed");
            const categoriaVoz = interaction.options.getChannel("categoria_voz");

            // ✅ 2. Guardar en JSON permanente
            setGuildConfig(tipo, interaction.guild.id, {
                canalEmbedId: canalEmbed.id,
                categoriaVozId: categoriaVoz.id
            });

            logger.info(`[${interaction.guild.id}] ${tipo} → embed: ${canalEmbed.id} | voz: ${categoriaVoz.id}`);

            await interaction.editReply({
                content: `✅ Configuración guardada para **${tipo.toUpperCase()}**:\n🔔 Embed: ${canalEmbed}\n🔊 Voz: ${categoriaVoz}`
            });

        } catch (err) {
            logger.error("❌ Error en registrar_canales:", err);
            await interaction.editReply({ content: "❌ Error al guardar configuración." });
        }
    }
};