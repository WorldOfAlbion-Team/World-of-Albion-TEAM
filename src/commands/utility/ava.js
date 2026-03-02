import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ava")
        .setDescription("Crea una party de AVA (Buff o Completa)")
        .addStringOption(opcion => opcion
            .setName("tipo")
            .setDescription("Tipo de party AVA")
            .setRequired(true)
            .addChoices(
                { name: "🔮 BUFF AVA", value: "buff" },
                { name: "⚔️ AVA COMPLETA", value: "completa" }
            )),

    async execute(interaction) {
        const tipo = interaction.options.getString("tipo");

        // Crear título según el tipo
        const titulo = tipo === "buff" ? "BUFF AVA" : "AVA COMPLETA";

        const modal = new ModalBuilder()
            .setCustomId("modal_ava")
            .setTitle(`Configuración: ${titulo}`);

        // Campo de título (pre-llenado)
        const tituloInput = new TextInputBuilder()
            .setCustomId("titulo")
            .setLabel("Título del Evento")
            .setStyle(TextInputStyle.Short)
            .setValue(titulo)
            .setRequired(true);

        // Canal y Tier combinados
        const canalYTier = new TextInputBuilder()
            .setCustomId("canal_tier")
            .setLabel("Canal ID | Tier")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Ej: 123456789 | 5.3")
            .setRequired(true);

        // Lugar y Hora combinados
        const lugarYTiempo = new TextInputBuilder()
            .setCustomId("lugar_tiempo")
            .setLabel("Lugar | Hora")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Ej: Portal Rojo | 20:00")
            .setRequired(true);

        // Descripción
        const descripcion = new TextInputBuilder()
            .setCustomId("descripcion")
            .setLabel("Descripción")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Detalles adicionales (opcional)")
            .setRequired(false);

        // Agregar campos al modal (máximo 5 ActionRows)
        modal.addComponents(
            new ActionRowBuilder().addComponents(tituloInput),
            new ActionRowBuilder().addComponents(canalYTier),
            new ActionRowBuilder().addComponents(lugarYTiempo),
            new ActionRowBuilder().addComponents(descripcion)
        );

        await interaction.showModal(modal);
    }
};
