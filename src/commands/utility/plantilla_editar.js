import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import { getTemplate, getAllTemplates } from "../../database.js";

export default {
    data: new SlashCommandBuilder()
        .setName("plantilla_editar")
        .setDescription("Edita una plantilla existente")
        .addStringOption(o => o.setName("nombre").setDescription("Nombre de la plantilla").setRequired(true).setAutocomplete(true)),

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        const templates = await getAllTemplates(interaction.guildId);
        const filtered = templates
            .filter(t => t.name.toLowerCase().includes(focused))
            .slice(0, 25)
            .map(t => ({ name: `${t.name} (${t.tipo})`, value: t.name }));
        await interaction.respond(filtered);
    },

    async execute(interaction) {
        const nombre = interaction.options.getString("nombre");
        const t = await getTemplate(interaction.guildId, nombre);

        if (!t) return interaction.reply({ content: `❌ No existe una plantilla llamada **"${nombre}"**.`, flags: 64 });

        const modal = new ModalBuilder()
            .setCustomId(`modal_editar_${t.id}`)
            .setTitle(`Editar: ${nombre}`);

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("titulo").setLabel("Título del evento")
                    .setStyle(TextInputStyle.Short).setValue(t.titulo).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("tier").setLabel("Tier mínimo")
                    .setStyle(TextInputStyle.Short).setValue(t.tier).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("lugar").setLabel("Lugar / Mapa")
                    .setStyle(TextInputStyle.Short).setValue(t.lugar).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("hora").setLabel("Hora del evento")
                    .setStyle(TextInputStyle.Short).setValue(t.hora).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("canal_id").setLabel("ID Canal destino")
                    .setStyle(TextInputStyle.Short).setValue(t.canal_id || "").setRequired(true)
            )
        );

        await interaction.showModal(modal);
    }
};
