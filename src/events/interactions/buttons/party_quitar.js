import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from "discord.js";
import { partyConfigs } from "../modals/armar_party_handle.js";
import { getPartyEventByMessageId, removePartyParticipant } from "../../../database.js";
import { validateVoiceChannel } from "../../../utils/voiceChannelValidator.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("party_quitar_")) return;

    const [, voiceChannelId] = interaction.customId.split("party_quitar_");
    
    let config = null;
    let configId = voiceChannelId;
    
    for (const [id, cfg] of partyConfigs.entries()) {
        if (id.includes(voiceChannelId) || cfg.canalId === voiceChannelId) {
            config = cfg;
            configId = id;
            break;
        }
    }

    if (!config) {
        const event = await getPartyEventByMessageId(interaction.message.id);
        if (event) {
            config = {
                titulo: event.titulo,
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
    const partyVoiceChannelId = config.voiceChannelId || config?.voice_channel_id;
    if (partyVoiceChannelId && !await validateVoiceChannel(interaction, partyVoiceChannelId)) {
        return;
    }

    const modal = new ModalBuilder()
        .setCustomId(`modal_quitar_miembro_${configId}`)
        .setTitle(`➖ Quitar: ${config.titulo}`);

    const usuarioInput = new TextInputBuilder()
        .setCustomId("usuario_id")
        .setLabel("Usuario a quitar (ID o mención)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ej: @usuario o 123456789")
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(usuarioInput));

    await interaction.showModal(modal);
};
