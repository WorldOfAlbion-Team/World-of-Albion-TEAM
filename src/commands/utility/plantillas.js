import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("plantillas")
        .setDescription("Gestiona plantillas de eventos AVA"),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("📋 Sistema de Plantillas AVA")
            .setColor("#9b59b6")
            .setDescription("Crea y usa plantillas para publicar eventos AVA rápidamente.")
            .addFields(
                { name: "📝 **Crear Plantilla**", value: "`/plantilla_crear` - Crea una nueva plantilla", inline: false },
                { name: "📤 **Usar Plantilla**", value: "`/plantilla_usar` - Publica un evento con una plantilla", inline: false },
                { name: "💾 **Guardar Actual**", value: "`/plantilla_guardar` - Guarda tu AVA actual como plantilla", inline: false },
                { name: "✏️ **Editar Plantilla**", value: "`/plantilla_editar` - Modifica una plantilla existente", inline: false },
                { name: "📋 **Listar Plantillas**", value: "`/plantilla_list` - Ver todas las plantillas", inline: false },
                { name: "🗑️ **Eliminar Plantilla**", value: "`/plantilla_eliminar` - Elimina una plantilla (Owner)", inline: false }
            )
            .setFooter({ text: "World of Albion • Sistema de Plantillas" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menu_plantillas")
                .setPlaceholder("Selecciona una opción...")
                .addOptions([
                    { label: "Crear Plantilla", value: "crear", emoji: "📝" },
                    { label: "Usar Plantilla", value: "usar", emoji: "📤" },
                    { label: "Guardar AVA Actual", value: "guardar", emoji: "💾" },
                    { label: "Editar Plantilla", value: "editar", emoji: "✏️" },
                    { label: "Listar Plantillas", value: "listar", emoji: "📋" }
                ])
        );

        await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
    }
};
