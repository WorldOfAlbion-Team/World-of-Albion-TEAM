import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from "discord.js";
import { partyConfigs, CATEGORIAS } from "../modals/armar_party_handle.js";
import { getPartyEventByMessageId } from "../../../database.js";
import { log } from "../../../utils/logger.js";
import { validateVoiceChannel } from "../../../utils/voiceChannelValidator.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("party_agregar_")) return;

    const [, voiceChannelId] = interaction.customId.split("party_agregar_");
    
    // Buscar en configuración temporal primero
    let config = null;
    let configId = voiceChannelId;
    
    for (const [id, cfg] of partyConfigs.entries()) {
        if (id.includes(voiceChannelId) || cfg.canalId === voiceChannelId) {
            config = cfg;
            configId = id;
            break;
        }
    }

    // Si no está en configuración temporal, buscar en base de datos
    if (!config) {
        const event = await getPartyEventByMessageId(interaction.message.id);
        if (event) {
            config = {
                titulo: event.titulo,
                categorias: event.roles_data.map(r => r.categoria),
                creatorId: event.leader_id,
                voiceChannelId: event.voice_channel_id
            };
            configId = interaction.message.id;
        }
    }

    if (!config) {
        return interaction.reply({ 
            content: "❌ Error: Party no encontrada.", 
            flags: 64 
        });
    }

    // Validar canal de voz (si existe)
    const partyVoiceChannelId = config.voiceChannelId || event?.voice_channel_id;
    if (partyVoiceChannelId && !await validateVoiceChannel(interaction, partyVoiceChannelId)) {
        return;
    }

    // Crear modal para agregar miembro
    const modal = new ModalBuilder()
        .setCustomId(`modal_agregar_miembro_${configId}`)
        .setTitle(`➕ Agregar: ${config.titulo}`);

    // Selector de usuario
    const usuarioInput = new TextInputBuilder()
        .setCustomId("usuario_id")
        .setLabel("Usuario (ID o mención)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ej: @usuario o 123456789")
        .setRequired(true);

    // Selector de categoría
    const categoriasOptions = config.categorias
        .map(cat => `${CATEGORIAS[cat]?.emoji || "•"} ${CATEGORIAS[cat]?.name || cat}`)
        .join("\n");
    
    const categoriaInput = new TextInputBuilder()
        .setCustomId("categoria")
        .setLabel("Categoría del rol")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("caller, tank, dps, heal, support, stopper")
        .setRequired(true);

    // Selector de arma (opcional)
    const armaInput = new TextInputBuilder()
        .setCustomId("arma")
        .setLabel("Arma (opcional)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ej: Great Axe, Holy Staff")
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(usuarioInput),
        new ActionRowBuilder().addComponents(categoriaInput),
        new ActionRowBuilder().addComponents(armaInput)
    );

    await interaction.showModal(modal);
};
