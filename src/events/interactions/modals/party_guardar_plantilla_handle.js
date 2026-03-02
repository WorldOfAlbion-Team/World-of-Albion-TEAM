import { EmbedBuilder } from "discord.js";
import { createTemplate, getTemplate } from "../../../database.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("modal_guardar_plantilla_party_")) return;

    const nombre = interaction.fields.getTextInputValue("nombre_plantilla");
    const config = interaction.client.partyConfigForTemplate;

    if (!config) {
        return interaction.reply({ 
            content: "❌ Error: No se encontró la configuración de la party.", 
            flags: 64 
        });
    }

    // Verificar si ya existe
    const existente = await getTemplate(interaction.guildId, nombre);
    if (existente) {
        return interaction.reply({ 
            content: `❌ Ya existe una plantilla con el nombre "${nombre}".`, 
            flags: 64 
        });
    }

    // Crear plantilla
    await createTemplate(
        interaction.guildId,
        nombre,
        "custom",
        config.titulo,
        config.tier,
        config.lugar,
        config.hora,
        "",
        config.categorias.map(cat => ({ categoria: cat, emoji: "" })),
        config.canalId
    );

    // Limpiar
    delete interaction.client.partyConfigForTemplate;

    const embed = new EmbedBuilder()
        .setTitle("✅ Plantilla Guardada")
        .setColor("#2ecc71")
        .setDescription(`La plantilla **${nombre}** ha sido guardada.`)
        .addFields(
            { name: "📝 Nombre", value: nombre, inline: true },
            { name: "🎮 Título", value: config.titulo, inline: true },
            { name: "📋 Categorías", value: config.categorias.join(", "), inline: false }
        )
        .setFooter({ text: "World of Albion" })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
};
