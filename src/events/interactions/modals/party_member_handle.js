import { EmbedBuilder } from "discord.js";
import { partyConfigs, CATEGORIAS } from "../modals/armar_party_handle.js";
import { getPartyEventByMessageId, addPartyParticipant, removePartyParticipant } from "../../../database.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("modal_agregar_miembro_") && 
        !interaction.customId.startsWith("modal_quitar_miembro_")) return;

    const isAgregar = interaction.customId.startsWith("modal_agregar_miembro_");
    const configId = interaction.customId.replace(/modal_(agregar|quitar)_miembro_/, "");
    const usuarioRaw = interaction.fields.getTextInputValue("usuario_id");
    
    // Extraer ID de usuario
    const userIdMatch = usuarioRaw.match(/<@!?(\d+)>/);
    const userId = userIdMatch ? userIdMatch[1] : usuarioRaw.replace(/\D/g, "");

    if (isAgregar) {
        const categoria = interaction.fields.getTextInputValue("categoria").toLowerCase();
        const arma = interaction.fields.getTextInputValue("arma") || "";

        // Buscar en configuración temporal
        let config = partyConfigs.get(configId);

        if (!config) {
            const event = await getPartyEventByMessageId(configId);
            if (event) {
                await addPartyParticipant(event.id, userId, categoria);
                
                const catInfo = CATEGORIAS[categoria];
                const embed = new EmbedBuilder()
                    .setTitle("✅ Miembro Agregado")
                    .setColor("#2ecc71")
                    .setDescription(`<@${userId}> agregado a **${catInfo?.emoji || "•"} ${catInfo?.name || categoria.toUpperCase()}**`)
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }
            return interaction.reply({ 
                content: "❌ Error: Party no encontrada.", 
                flags: 64 
            });
        }

        config.participantes.set(userId, { categoria, arma });

        const catInfo = CATEGORIAS[categoria];
        const embed = new EmbedBuilder()
            .setTitle("✅ Miembro Agregado")
            .setColor("#2ecc71")
            .setDescription(`<@${userId}> agregado a **${catInfo?.emoji || "•"} ${catInfo?.name || categoria.toUpperCase()}**${arma ? `\n🗡️ Arma: ${arma}` : ""}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: 64 });
    } else {
        // Quitar miembro
        let config = partyConfigs.get(configId);

        if (!config) {
            const event = await getPartyEventByMessageId(configId);
            if (event) {
                await removePartyParticipant(event.id, userId);
                
                const embed = new EmbedBuilder()
                    .setTitle("✅ Miembro Quitado")
                    .setColor("#e74c3c")
                    .setDescription(`<@${userId}> quitado de la party`)
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }
            return interaction.reply({ 
                content: "❌ Error: Party no encontrada.", 
                flags: 64 
            });
        }

        config.participantes.delete(userId);

        const embed = new EmbedBuilder()
            .setTitle("✅ Miembro Quitado")
            .setColor("#e74c3c")
            .setDescription(`<@${userId}> quitado de la party`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: 64 });
    }
};
