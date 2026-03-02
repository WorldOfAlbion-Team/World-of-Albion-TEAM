import { EmbedBuilder, MessageFlags } from "discord.js";
import { ctaParticipants } from "../selects/cta_unirse.js";

export default async function (interaction) {
    if (interaction.customId !== "modal_quitar_usuario") return;

    const userInput = interaction.fields.getTextInputValue("user_id");
    const userId = userInput.replace(/[<@>]/g, "");
    const messageId = interaction.message.id;
    const participants = ctaParticipants.get(messageId) || {};

    if (!participants[userId]) {
        return interaction.reply({ content: "❌ Usuario no está anotado.", flags: MessageFlags.Ephemeral });
    }

    const embed = interaction.message.embeds[0];
    const fields = [...embed.data.fields];

    for (let i = 0; i < fields.length; i++) {
        if (fields[i].value?.includes(`<@${userId}>`)) {
            fields[i].value = fields[i].value.replace(`<@${userId}>`, "(0/1)");
            delete participants[userId];
            ctaParticipants.set(messageId, participants);
        }
    }

    const nuevoEmbed = EmbedBuilder.from(embed).setFields(fields);
    await interaction.update({ embeds: [nuevoEmbed] });
    await interaction.reply({ content: `✅ Usuario removido.`, flags: MessageFlags.Ephemeral });
}
