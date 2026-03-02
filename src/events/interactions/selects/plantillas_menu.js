export default async function (interaction) {
    if (interaction.customId !== "menu_plantillas") return;

    const value = interaction.values[0];

    // Actualizar el embed con información según la opción seleccionada
    const embed = interaction.message.embeds[0];
    
    switch (value) {
        case "crear":
            embed.setFields(
                { name: "📝 Crear Plantilla", value: "Usa `/plantilla_crear` para crear una nueva plantilla con todos los detalles.", inline: false }
            );
            break;
        case "usar":
            embed.setFields(
                { name: "📤 Usar Plantilla", value: "Usa `/plantilla_usar` y selecciona una plantilla para publicar el evento directamente.", inline: false }
            );
            break;
        case "guardar":
            embed.setFields(
                { name: "💾 Guardar AVA Actual", value: "Usa `/plantilla_guardar` después de configurar un AVA para guardarlo como plantilla.", inline: false }
            );
            break;
        case "editar":
            embed.setFields(
                { name: "✏️ Editar Plantilla", value: "Usa `/plantilla_editar` para modificar los detalles de una plantilla existente.", inline: false }
            );
            break;
        case "listar":
            embed.setFields(
                { name: "📋 Listar Plantillas", value: "Usa `/plantilla_list` para ver todas las plantillas disponibles.", inline: false }
            );
            break;
    }

    await interaction.update({ embeds: [embed] });
};
