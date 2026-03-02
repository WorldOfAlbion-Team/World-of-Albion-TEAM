import { avaDrafts } from "../modals/ava_handle.js";

// Botón: Cancelar (AVA)
export default async function (interaction) {
    if (interaction.customId !== "ava_cancel") return;

    const data = avaDrafts.get(interaction.user.id);
    if (data) {
        avaDrafts.delete(interaction.user.id);
    }

    await interaction.update({
        content: "❌ Party cancelada.",
        embeds: [],
        components: []
    });
};
