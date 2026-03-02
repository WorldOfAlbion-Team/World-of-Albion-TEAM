import { ctaDrafts } from "../modals/cta_handle.js";

export default async function (interaction) {
    if (interaction.customId !== "cta_cancel") return;

    ctaDrafts.delete(interaction.user.id);
    await interaction.deleteReply().catch(() => null);
}
