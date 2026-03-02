import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import { avaDrafts } from "../../events/interactions/modals/ava_handle.js";

export default {
    data: new SlashCommandBuilder()
        .setName("plantilla_guardar")
        .setDescription("Guarda tu configuración actual de AVA como plantilla reutilizable"),

    async execute(interaction) {
        const data = avaDrafts.get(interaction.user.id);

        if (!data) {
            return interaction.reply({
                content: "❌ No tienes una configuración de AVA activa. Usa `/ava` primero y configura los roles.",
                flags: 64
            });
        }

        const modal = new ModalBuilder()
            .setCustomId("modal_guardar_plantilla")
            .setTitle("Guardar como Plantilla");

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("nombre_plantilla")
                    .setLabel("Nombre de la plantilla")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("Ej: AVA Buff Lunes")
                    .setRequired(true)
            )
        );

        await interaction.showModal(modal);
    }
};
