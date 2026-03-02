import { ctaDrafts } from "../modals/cta_handle.js";

export default async function (interaction) {
    if (interaction.customId !== "cta_undo") return;

    const data = ctaDrafts.get(interaction.user.id);
    if (!data) {
        return interaction.reply({ content: "❌ No hay configuración activa.", flags: 64 });
    }

    if (data.roles.length === 0) {
        return interaction.reply({ content: "❌ No hay roles para quitar.", flags: 64 });
    }

    // Quitar último rol
    data.roles.pop();

    // Actualizar embed
    const embed = interaction.message.embeds[0];
    const fields = embed.data.fields.filter(f => !f.name.includes("Selecciona:"));

    if (data.roles.length > 0) {
        const rolesText = data.roles.map((r, i) => `${r.emoji} **${i + 1}.** ${r.label}`).join("\n");
        fields.push({ name: "📋 Roles Configurados", value: rolesText, inline: false });
    }

    await interaction.update({ embeds: [{ ...embed.data, fields }] });
}
