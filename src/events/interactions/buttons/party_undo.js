import { EmbedBuilder } from "discord.js";
import { partyDrafts } from "../modals/armar_party_handle.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("party_undo")) return;

    const data = partyDrafts.get(interaction.user.id);

    if (!data || data.rolesElegidos.length === 0) {
        return interaction.reply({ content: "❌ No hay roles para eliminar.", flags: 64 });
    }

    // Elimina el último rol añadido
    data.rolesElegidos.pop();
    partyDrafts.set(interaction.user.id, data);

    // Reconstruir la lista de roles para el Embed
    const listaRoles = data.rolesElegidos
        .map((r, i) => `**${i + 1}.** ${r.emoji} ${r.label}`)
        .join("\n") || "Selecciona las armas para los puestos disponibles.";

    const embedActualizado = new EmbedBuilder()
        .setTitle(`<:WOA:1441970541517996114> CONFIGURACIÓN: ${data.titulo.toUpperCase()}`)
        .setColor("#f1c40f")
        .setDescription(`📍 **Destino:** <#${data.canalId}>\n${listaRoles}`)
        .addFields(
            { name: "🛡️ Tier", value: data.tier, inline: true },
            { name: "📍 Lugar", value: data.lugar, inline: true },
            { name: "⏰ Hora", value: data.hora, inline: true }
        );

    await interaction.update({ embeds: [embedActualizado] });
}
