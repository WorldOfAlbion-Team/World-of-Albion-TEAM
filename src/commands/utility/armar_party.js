import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("armar_party")
        .setDescription("Crea una party personalizada con categorías definidas por ti"),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("modal_armar_party_basico")
            .setTitle("Configurar Party");

        const tituloInput = new TextInputBuilder()
            .setCustomId("titulo")
            .setLabel("Título de la Party")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ej: GvG Martes")
            .setRequired(true);

        const canalTierInput = new TextInputBuilder()
            .setCustomId("canal_tier")
            .setLabel("Canal ID | Tier")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Ej: 123456789 | 5.3")
            .setRequired(true);

        const lugarHoraInput = new TextInputBuilder()
            .setCustomId("lugar_hora")
            .setLabel("Lugar | Hora")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Ej: Portal Rojo | 20:00")
            .setRequired(true);

        const categoriasInput = new TextInputBuilder()
            .setCustomId("categorias")
            .setLabel("Categorías (caller,tank,dps,heal,support)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ej: caller,tank,dps,heal,support")
            .setValue("tank,dps,heal")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(tituloInput),
            new ActionRowBuilder().addComponents(canalTierInput),
            new ActionRowBuilder().addComponents(lugarHoraInput),
            new ActionRowBuilder().addComponents(categoriasInput)
        );

        await interaction.showModal(modal);
    }
};
