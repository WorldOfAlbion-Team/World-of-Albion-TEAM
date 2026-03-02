import { EmbedBuilder } from "discord.js";
import { WEAPONS_DICT } from "../../../utils/items.js";
import { partyDrafts } from "../modals/armar_party_handle.js";

export default async function (interaction) {
    if (interaction.customId !== "party_add_weapon") return;

    const [categoria, armaValue] = interaction.values[0].split("|");
    const data = partyDrafts.get(interaction.user.id);

    if (!data) return interaction.reply({ content: "❌ Sesión expirada.", flags: 64 });

    const armaObjeto = WEAPONS_DICT[categoria].find(a => a.value === armaValue);

    if (data.rolesElegidos.length >= 50) {
        return interaction.reply({ content: "⚠️ Máximo 50 roles.", flags: 64 });
    }

    data.rolesElegidos.push(armaObjeto);

    const listaRoles = data.rolesElegidos
        .map((r, index) => `**${index + 1}.** ${r.emoji} ${r.label}`)
        .join("\n");

    const nuevoEmbed = new EmbedBuilder()
        .setTitle(`<:WOA:1441970541517996114> CONFIGURACIÓN: ${data.titulo.toUpperCase()}`)
        .setColor("#f1c40f")
        .setDescription(`📍 **Destino:** <#${data.canalId}>\n${listaRoles}`)
        .addFields(
            { name: "🛡️ Tier", value: data.tier, inline: true },
            { name: "📍 Lugar", value: data.lugar, inline: true },
            { name: "⏰ Hora", value: data.hora, inline: true }
        );

    await interaction.update({ embeds: [nuevoEmbed] });
}
