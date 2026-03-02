import { ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } from "discord.js";
import { WEAPONS_DICT } from "../../../utils/items.js";
import { log } from "../../../utils/logger.js";

// Select: Añadir Categoría (AVA)
export default async function (interaction) {
    if (interaction.customId !== "ava_add_category") return;

    const categoriaElegida = interaction.values[0];
    const armas = WEAPONS_DICT[categoriaElegida];

    if (!armas) {
        return interaction.reply({ 
            content: "❌ No se encontraron armas para esta categoría.", 
            flags: MessageFlags.Ephemeral 
        });
    }

    const selectArmas = new StringSelectMenuBuilder()
        .setCustomId("ava_add_weapon")
        .setPlaceholder(`Elige un arma de ${categoriaElegida}...`)
        .addOptions(armas.slice(0, 25).map(arma => ({
            label: arma.label,
            value: `${categoriaElegida}|${arma.value}`,
            emoji: arma.emoji
        })));

    const rowArmas = new ActionRowBuilder().addComponents(selectArmas);

    const componentesActuales = [...interaction.message.components];

    const nuevasFilas = [
        componentesActuales[0],
        rowArmas,
        componentesActuales[componentesActuales.length - 1]
    ];

    try {
        await interaction.update({ components: nuevasFilas });
    } catch (error) {
        log.error("Error actualizando componentes (ava_add_category):", error);
        await interaction.followUp({ 
            content: "❌ Error al cargar las armas. Intenta de nuevo.", 
            flags: MessageFlags.Ephemeral 
        });
    }
};
