import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from "discord.js";
import { partyConfigs, CATEGORIAS } from "../modals/armar_party_handle.js";
import { createTemplate, getTemplate } from "../../../database.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("party_guardar_plantilla_")) return;

    const configId = interaction.customId.replace("party_guardar_plantilla_", "");
    const config = partyConfigs.get(configId);

    if (!config) {
        return interaction.reply({ 
            content: "❌ Error: Configuración no encontrada.", 
            flags: 64 
        });
    }

    // Verificar que es el creador
    if (interaction.user.id !== config.creatorId) {
        return interaction.reply({ 
            content: "❌ Solo el creador puede guardar la plantilla.", 
            flags: 64 
        });
    }

    // Crear modal para nombrar la plantilla
    const modal = new ModalBuilder()
        .setCustomId(`modal_guardar_plantilla_party_${configId}`)
        .setTitle("💾 Guardar Plantilla");

    const nombreInput = new TextInputBuilder()
        .setCustomId("nombre_plantilla")
        .setLabel("Nombre de la plantilla")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ej: GvG Martes")
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(nombreInput));

    // Guardar referencia al config en el cliente
    interaction.client.partyConfigForTemplate = config;

    await interaction.showModal(modal);
};
