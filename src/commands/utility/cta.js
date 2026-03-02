import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

// Map global para datos temporales del CTA
const ctaTempMap = new Map();
export { ctaTempMap };

export default {
    data: new SlashCommandBuilder()
        .setName("cta")
        .setDescription("Crea un Call To Arms con roles específicos")
        .addStringOption(o => o.setName("titulo").setDescription("Título del CTA").setRequired(true))
        .addStringOption(o => o.setName("hora").setDescription("Hora del evento (Ej: 20:00)").setRequired(true))
        .addStringOption(o => o.setName("lugar").setDescription("Lugar o mapa del CTA").setRequired(true)),

    async execute(interaction) {
        const titulo = interaction.options.getString("titulo");
        const hora   = interaction.options.getString("hora");
        const lugar  = interaction.options.getString("lugar");

        // Guardar con user.id como clave (consistente con el modal handler)
        interaction.client.ctaDataMap = interaction.client.ctaDataMap || new Map();
        interaction.client.ctaDataMap.set(interaction.user.id, { titulo, hora, lugar });

        const modal = new ModalBuilder()
            .setCustomId("modal_cta")
            .setTitle(`CTA: ${titulo}`);

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("canal_id")
                    .setLabel("ID del canal destino")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("Click derecho en el canal → Copiar ID")
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("descripcion")
                    .setLabel("Descripción o notas (opcional)")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
            )
        );

        await interaction.showModal(modal);
    }
};
