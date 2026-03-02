import { EmbedBuilder } from "discord.js";
import { partyConfigs, CATEGORIAS } from "../modals/armar_party_handle.js";

export default async function (interaction) {
    const customId = interaction.customId;
    
    // Verificar si es un selector de arma
    if (!customId.startsWith("arma_")) return;
    
    // Parsear: arma_categoria_configId
    const [, categoriaRaw, configId] = customId.split("_");
    const selectedValue = interaction.values[0];
    
    const [arma, categoria] = selectedValue.split("|");
    
    // Buscar configuración
    const config = partyConfigs.get(configId);
    if (!config) {
        return interaction.reply({ 
            content: "❌ Configuración no encontrada.", 
            flags: 64 
        });
    }
    
    // Guardar arma para la categoría
    if (!config.armas) config.armas = new Map();
    config.armas.set(categoria, arma === "ninguna" ? null : arma);
    
    const catInfo = CATEGORIAS[categoria];
    const armaTexto = arma === "ninguna" ? "Sin arma específica" : arma;
    
    const embed = new EmbedBuilder()
        .setTitle("✅ Arma Configurada")
        .setColor("#2ecc71")
        .setDescription(`**${catInfo?.emoji || "•"} ${catInfo?.name || categoria.toUpperCase()}** tendrá: ${armaTexto}`)
        .setTimestamp();
    
    await interaction.update({
        embeds: [embed],
        components: interaction.message.components
    });
};
