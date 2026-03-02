import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("plantilla_crear")
        .setDescription("Crea una nueva plantilla de evento reutilizable")
        .addStringOption(o => o.setName("nombre").setDescription("Nombre identificador de la plantilla").setRequired(true))
        .addStringOption(o => o.setName("tipo").setDescription("Tipo de evento").setRequired(true)
            .addChoices(
                { name: "🔮 BUFF AVA",     value: "buff" },
                { name: "⚔️ AVA COMPLETA", value: "completa" },
                { name: "🎮 OTRO",         value: "otro" }
            )),

    async execute(interaction) {
        const nombre = interaction.options.getString("nombre");
        const tipo   = interaction.options.getString("tipo");

        const modal = new ModalBuilder()
            .setCustomId(`modal_plantilla_${nombre}__${tipo}`)
            .setTitle(`Nueva plantilla: ${nombre}`);

        // Campo 1: Título del evento
        const tituloInput = new TextInputBuilder()
            .setCustomId("titulo")
            .setLabel("Título del evento")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ej: AVA Buff Jueves")
            .setRequired(true);

        // Campo 2: Tier
        const tierInput = new TextInputBuilder()
            .setCustomId("tier")
            .setLabel("Tier mínimo requerido")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ej: 6.3  o  8.0")
            .setRequired(true);

        // Campo 3: Lugar
        const lugarInput = new TextInputBuilder()
            .setCustomId("lugar")
            .setLabel("Lugar / Mapa del evento")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ej: Portal Rojo — Fort Sterling")
            .setRequired(true);

        // Campo 4: Hora
        const horaInput = new TextInputBuilder()
            .setCustomId("hora")
            .setLabel("Hora del evento (UTC/local)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ej: 20:00")
            .setRequired(true);

        // Campo 5: Canal ID
        const canalInput = new TextInputBuilder()
            .setCustomId("canal_id")
            .setLabel("ID del canal destino")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Click derecho en el canal → Copiar ID")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(tituloInput),
            new ActionRowBuilder().addComponents(tierInput),
            new ActionRowBuilder().addComponents(lugarInput),
            new ActionRowBuilder().addComponents(horaInput),
            new ActionRowBuilder().addComponents(canalInput)
        );

        await interaction.showModal(modal);
    }
};
