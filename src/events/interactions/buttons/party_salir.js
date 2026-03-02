import { EmbedBuilder } from "discord.js";

export default async function (interaction) {
    if (interaction.customId !== "party_salir") return;

    const embed = interaction.message.embeds[0];
    const newEmbed = EmbedBuilder.from(embed);
    const fields = [...embed.fields];
    const userMention = `<@${interaction.user.id}>`;

    let seSalio = false;
    
    // Buscar en campos de COMPOSICIÓN (para parties personalizadas de /armar_party)
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].name === "⚔️ COMPOSICIÓN" || fields[i].name === "\u200B") {
            if (fields[i].value.includes(userMention)) {
                // Reemplazar el mention con el formato (0/1)
                fields[i].value = fields[i].value.replace(userMention, "(0/1)");
                seSalio = true;
            }
        }
    }

    // Si no se encontró en COMPOSICIÓN, buscar en campos "Roles" (para parties de dorados)
    if (!seSalio) {
        for (let i = 0; i < fields.length; i++) {
            if (fields[i].name.includes("ROLES") && fields[i].value.includes(userMention)) {
                fields[i].value = fields[i].value.replace(userMention, "(Vacío)");
                seSalio = true;
            }
        }
    }

    if (!seSalio) return interaction.reply({ content: "No estás en esta party.", flags: 64 });

    newEmbed.setFields(fields);
    await interaction.update({ embeds: [newEmbed] });
}
