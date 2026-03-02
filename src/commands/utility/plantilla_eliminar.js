import { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } from "discord.js";
import { deleteTemplate, getAllTemplates } from "../../database.js";

export default {
    data: new SlashCommandBuilder()
        .setName("plantilla_eliminar")
        .setDescription("Elimina una plantilla (Solo Owner)"),

    async execute(interaction) {
        const templates = await getAllTemplates(interaction.guildId);
        
        if (templates.length === 0) {
            return interaction.reply({ 
                content: "❌ No hay plantillas para eliminar.", 
                flags: 64 
            });
        }

        // Crear select menu para elegir plantilla
        const options = templates.map(t => ({
            label: t.name,
            value: t.id.toString(),
            description: `${t.titulo} - ${t.tier}`
        }));

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_eliminar_plantilla")
                .setPlaceholder("Selecciona la plantilla a eliminar")
                .addOptions(options)
        );

        await interaction.reply({ 
            content: "Selecciona la plantilla que deseas eliminar:", 
            components: [row], 
            flags: 64 
        });
    }
};
