import { EmbedBuilder, MessageFlags } from "discord.js";
import { ctaParticipants } from "../selects/cta_unirse.js";

export default async function (interaction) {
    if (interaction.customId !== "modal_agregar_usuario") return;

    const userInput = interaction.fields.getTextInputValue("user_id");
    const rolIndex = parseInt(interaction.fields.getTextInputValue("rol_index")) - 1;
    
    const userId = userInput.replace(/[<@>]/g, "");
    const messageId = interaction.message.id;
    const participants = ctaParticipants.get(messageId) || {};

    if (participants[userId]) {
        return interaction.reply({ content: "❌ Usuario ya está anotado.", flags: MessageFlags.Ephemeral });
    }

    const embed = interaction.message.embeds[0];
    const fields = [...embed.data.fields];
    let actualizado = false;

    for (let i = 0; i < fields.length; i++) {
        if (fields[i].value?.includes("(0/1)")) {
            const lineas = fields[i].value.split("\n");
            const nuevaLista = lineas.map(linea => {
                if (linea.startsWith(`**${rolIndex + 1}.**`) && linea.includes("(0/1)")) {
                    actualizado = true;
                    participants[userId] = rolIndex;
                    ctaParticipants.set(messageId, participants);
                    return linea.replace("(0/1)", `<@${userId}>`);
                }
                return linea;
            }).join("\n");
            fields[i].value = nuevaLista;
        }
    }

    if (!actualizado) {
        return interaction.reply({ content: "❌ Puesto inválido.", flags: MessageFlags.Ephemeral });
    }

    const nuevoEmbed = EmbedBuilder.from(embed).setFields(fields);
    await interaction.update({ embeds: [nuevoEmbed] });
    await interaction.reply({ content: `✅ Usuario agregado.`, flags: MessageFlags.Ephemeral });
}
