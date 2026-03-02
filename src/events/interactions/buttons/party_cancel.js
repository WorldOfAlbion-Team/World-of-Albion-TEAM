import { MessageFlags } from "discord.js";
import { partyDrafts } from "../modals/armar_party_handle.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("party_cancel")) return;

    // Borrar de la memoria RAM
    partyDrafts.delete(interaction.user.id);

    // Actualizar el mensaje para cerrarlo
    await interaction.update({
        content: "❌ Configuración cancelada y borrador eliminado.",
        embeds: [],
        components: []
    });
}