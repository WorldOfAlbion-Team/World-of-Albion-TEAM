import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } from "discord.js";

export default async function (interaction) {
    if (interaction.customId !== "cta_quitar") return;

    const modal = new ModalBuilder()
        .setCustomId("modal_quitar_usuario")
        .setTitle("Quitar Usuario");

    const userInput = new TextInputBuilder()
        .setCustomId("user_id")
        .setLabel("ID o Mención del usuario")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ej: @usuario o ID")
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(userInput));

    await interaction.showModal(modal);
}
