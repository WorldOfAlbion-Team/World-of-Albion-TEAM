import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } from "discord.js";

export default async function (interaction) {
    if (interaction.customId !== "cta_agregar") return;

    const modal = new ModalBuilder()
        .setCustomId("modal_agregar_usuario")
        .setTitle("Agregar Usuario");

    const userInput = new TextInputBuilder()
        .setCustomId("user_id")
        .setLabel("ID o Mención del usuario")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ej: @usuario o ID")
        .setRequired(true);

    const rolInput = new TextInputBuilder()
        .setCustomId("rol_index")
        .setLabel("Número del rol (1-21)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ej: 1")
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(userInput),
        new ActionRowBuilder().addComponents(rolInput)
    );

    await interaction.showModal(modal);
}
