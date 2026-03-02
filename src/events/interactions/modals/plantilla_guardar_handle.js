import { EmbedBuilder } from "discord.js";
import { createTemplate, getTemplate, updateTemplate } from "../../../database.js";

const tempDataMap = new Map();

export default async function (interaction) {
    // Manejar modal de AVA (modal_guardar_plantilla)
    if (interaction.customId === "modal_guardar_plantilla") {
        return handleAvaTemplate(interaction);
    }
    
    // Manejar modal de Party Armar (modal_guardar_plantilla_party_XXX)
    if (interaction.customId.startsWith("modal_guardar_plantilla_party_")) {
        return handlePartyTemplate(interaction);
    }
}

async function handleAvaTemplate(interaction) {
    const nombre = interaction.fields.getTextInputValue("nombre_plantilla");
    
    // Obtener datos - intentar primero con interaction.client.tempPlantillaDataMap
    let data = null;
    if (interaction.client.tempPlantillaDataMap) {
        data = interaction.client.tempPlantillaDataMap.get(interaction.client.tempPlantillaData);
    }
    // Si no se encuentra, intentar con el ID del usuario
    if (!data) {
        data = tempDataMap.get(interaction.user.id);
    }

    if (!data) {
        return interaction.reply({ 
            content: "❌ Error: No se encontraron los datos de la plantilla. Asegúrate de usar /ava primero.", 
            flags: 64 
        });
    }

    // Determinar si es actualizar o crear
    const existente = await getTemplate(interaction.guildId, nombre);
    
    // Determinar el título basado en el tipo
    const titulo = data.tipo === "buff" ? "🔮 BUFF AVA" : "⚔️ AVA COMPLETA";

    if (existente) {
        // Actualizar plantilla existente
        await updateTemplate(
            existente.id,
            titulo,
            data.tier,
            data.lugar,
            data.hora,
            data.descripcion || "",
            data.rolesElegidos || [],
            data.canalId
        );
    } else {
        // Crear nueva plantilla
        await createTemplate(
            interaction.guildId,
            nombre,
            data.tipo,
            titulo,
            data.tier,
            data.lugar,
            data.hora,
            data.descripcion || "",
            data.rolesElegidos || [],
            data.canalId
        );
    }

    // Limpiar datos temporales
    if (interaction.client.tempPlantillaData) {
        interaction.client.tempPlantillaDataMap?.delete(interaction.client.tempPlantillaData);
    }
    tempDataMap.delete(interaction.user.id);

    const embed = new EmbedBuilder()
        .setTitle(existente ? "✅ Plantilla Actualizada" : "✅ Plantilla Guardada")
        .setColor("#2ecc71")
        .setDescription(`La plantilla **${nombre}** ha sido ${existente ? "actualizada" : "guardada"} con ${(data.rolesElegidos || []).length} roles.`)
        .addFields(
            { name: "📝 Nombre", value: nombre, inline: true },
            { name: "🎯 Tipo", value: titulo, inline: true },
            { name: "🛡️ Tier", value: data.tier || "N/A", inline: true },
            { name: "📍 Lugar", value: data.lugar || "N/A", inline: true },
            { name: "⏰ Hora", value: data.hora || "N/A", inline: true },
            { name: "👥 Roles", value: `${(data.rolesElegidos || []).length} roles`, inline: true }
        )
        .setFooter({ text: "Usa /plantilla_usar para usar esta plantilla" })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
}

async function handlePartyTemplate(interaction) {
    const nombre = interaction.fields.getTextInputValue("nombre_plantilla");
    
    // Obtener datos del config de party
    const config = interaction.client.partyConfigForTemplate;
    
    if (!config) {
        return interaction.reply({ 
            content: "❌ Error: No se encontraron los datos de la party. Asegúrate de usar /armar_party primero.", 
            flags: 64 
        });
    }

    // Verificar si ya existe
    const existente = await getTemplate(interaction.guildId, nombre);
    
    // Convertir categorías a formato de roles
    const rolesData = config.categorias.map((cat, index) => ({
        label: cat.toUpperCase(),
        value: `${cat.toUpperCase()}_${index}`,
        emoji: getCategoryEmoji(cat),
        defaultRole: cat
    }));

    // Determinar el título
    const titulo = `⚔️ ${config.titulo}`;

    if (existente) {
        // Actualizar plantilla existente
        await updateTemplate(
            existente.id,
            titulo,
            config.tier,
            config.lugar,
            config.hora,
            "",
            rolesData,
            config.canalId
        );
    } else {
        // Crear nueva plantilla
        await createTemplate(
            interaction.guildId,
            nombre,
            "party",
            titulo,
            config.tier,
            config.lugar,
            config.hora,
            "",
            rolesData,
            config.canalId
        );
    }

    const embed = new EmbedBuilder()
        .setTitle(existente ? "✅ Plantilla Actualizada" : "✅ Plantilla Guardada")
        .setColor("#2ecc71")
        .setDescription(`La plantilla **${nombre}** ha sido ${existente ? "actualizada" : "guardada"} con ${rolesData.length} categorías.`)
        .addFields(
            { name: "📝 Nombre", value: nombre, inline: true },
            { name: "🎯 Tipo", value: "Party Personalizada", inline: true },
            { name: "🛡️ Tier", value: config.tier || "N/A", inline: true },
            { name: "📍 Lugar", value: config.lugar || "N/A", inline: true },
            { name: "⏰ Hora", value: config.hora || "N/A", inline: true },
            { name: "👥 Categorías", value: `${rolesData.length}: ${config.categorias.join(", ")}`, inline: true }
        )
        .setFooter({ text: "Usa /plantilla_usar para usar esta plantilla" })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
}

function getCategoryEmoji(categoria) {
    const emojis = {
        caller: "📢",
        tank: "🛡️",
        dps: "⚔️",
        heal: "💚",
        support: "✨",
        stopper: "🛑"
    };
    return emojis[categoria] || "•";
}

// Exportar funciones para guardar datos temporalmente
export function setTempData(key, data) {
    tempDataMap.set(key, data);
}
