import { EmbedBuilder, MessageFlags } from "discord.js";
import { getAvaEventByMessageId, addAvaParticipant, removeAvaParticipant } from "../../../database.js";

// Select: Unirse a Party AVA
export default async function (interaction) {
    if (interaction.customId !== "unirse_ava_select") return;

    const value = interaction.values[0];
    const embedOriginal = interaction.message.embeds[0];
    const fields = [...embedOriginal.data.fields];
    const userId = interaction.user.id;
    
    // Obtener evento de la base de datos
    const eventData = await getAvaEventByMessageId(interaction.message.id);
    if (!eventData) {
        return interaction.reply({ content: "❌ Error: Evento no encontrado en la base de datos.", flags: MessageFlags.Ephemeral });
    }

    // Desanotarse
    if (value === "desanotarse") {
        let encontrado = false;
        for (let i = 0; i < fields.length; i++) {
            if (fields[i].value.includes(`<@${userId}>`)) {
                fields[i].value = fields[i].value.replace(`<@${userId}>`, "**(0/1)**");
                encontrado = true;
            }
        }
        if (!encontrado) return interaction.reply({ content: "❌ No estás en la lista.", flags: MessageFlags.Ephemeral });
        
        // Actualizar base de datos
        await removeAvaParticipant(eventData.id, userId);
        
        const nuevoEmbed = EmbedBuilder.from(embedOriginal).setFields(fields);
        return await interaction.update({ embeds: [nuevoEmbed] });
    }

    // Unirse
    const indexElegido = parseInt(value);
    let yaAnotado = false;
    
    fields.forEach(f => { if (f.value.includes(`<@${userId}>`)) yaAnotado = true; });
    if (yaAnotado) return interaction.reply({ content: "❌ Ya estás ocupando un lugar.", flags: MessageFlags.Ephemeral });

    let actualizado = false;
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].name === "⚔️ COMPOSICIÓN" || fields[i].name === "\u200B") {
            const lineas = fields[i].value.split("\n");
            const nuevaLista = lineas.map(linea => {
                if (linea.startsWith(`**${indexElegido + 1}.**`) && linea.includes("(0/1)")) {
                    actualizado = true;
                    return linea.replace("(0/1)", `<@${userId}>`);
                }
                return linea;
            }).join("\n");
            fields[i].value = nuevaLista;
        }
    }

    if (!actualizado) return interaction.reply({ content: "❌ Puesto ocupado o inválido.", flags: MessageFlags.Ephemeral });

    // Actualizar base de datos
    await addAvaParticipant(eventData.id, userId, indexElegido);

    const nuevoEmbed = EmbedBuilder.from(embedOriginal).setFields(fields);
    await interaction.update({ embeds: [nuevoEmbed] });
};
