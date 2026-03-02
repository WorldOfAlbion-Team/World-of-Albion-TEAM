// src/events/interactions/buttons/button-dorados.js - Botones para eventos Dorados
import { EmbedBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import { activeEvents } from "../../../state/activeEvents.js";
import { ROLES } from "../../../constants/emojis.js";
import { getLogChannel } from "../../../database.js";
import { log } from "../../../utils/logger.js";
import { COLORS } from "../../../utils/colors.js";

export default async function (interaction) {
    const [prefixRaw, eventId] = interaction.customId.split("|");
    const action = prefixRaw.replace("dorados-", "");
    const event = activeEvents.get(eventId);

    if (!event) {
        return interaction.reply({ 
            content: "❌ Evento no encontrado o ya finalizado.", 
            flags: MessageFlags.Ephemeral 
        });
    }

    // ACCIÓN: SALIR
    if (action === "salir") {
        let found = false;
        for (const r in event.roles) {
            if (event.roles[r] === interaction.user.id) {
                event.roles[r] = null;
                found = true;
            }
        }
        
        if (!found) {
            return interaction.reply({ 
                content: "❌ No estás inscrito en esta party.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        const list = Object.entries(event.roles)
            .map(([k, v]) => {
                const emoji = ROLES[k.toUpperCase()] || "➖";
                return `${emoji} **${k.toUpperCase()}:** ${v ? `<@${v}>` : "(Vacío)"}`;
            })
            .join("\n");

        // Truncar si es muy largo
        const truncatedList = list.length > 900 ? list.substring(0, 900) + "..." : list;

        const embed = EmbedBuilder.from(interaction.message.embeds[0])
            .setFields(
                { name: "📢 CALLER", value: `<@${event.creatorId}>`, inline: true },
                { name: "⏰ HORA", value: event.hora, inline: true },
                { name: "📝 DESCRIPCIÓN", value: event.descripcion || "*Sin descripción*", inline: false },
                { name: "🛡️ ROLES", value: truncatedList, inline: false },
                { name: "🔊 VOZ", value: `<#${event.voiceChannelId}>`, inline: false }
            );

        log.interaction('button', `dorados-salir`);
        return interaction.update({ embeds: [embed] });
    }

    // ACCIÓN: AGREGAR USUARIO (solo creador)
    if (action === "agregar") {
        if (interaction.user.id !== event.creatorId) {
            return interaction.reply({ 
                content: "❌ Solo el creador puede agregar usuarios.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        const modal = new ModalBuilder()
            .setCustomId(`dorados-agregar-modal|${eventId}`)
            .setTitle("Agregar Usuario");

        const userInput = new TextInputBuilder()
            .setCustomId("user_id")
            .setLabel("Usuario (ID o mención)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ej: @usuario o 123456789")
            .setRequired(true);

        const roleSelect = new TextInputBuilder()
            .setCustomId("role_name")
            .setLabel("Rol del jugador")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("tank, heal, flami, maldi, perfora1, perfora2, prisma")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(userInput),
            new ActionRowBuilder().addComponents(roleSelect)
        );

        return interaction.showModal(modal);
    }

    // ACCIÓN: QUITAR USUARIO (solo creador)
    if (action === "quitar") {
        if (interaction.user.id !== event.creatorId) {
            return interaction.reply({ 
                content: "❌ Solo el creador puede quitar usuarios.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        const modal = new ModalBuilder()
            .setCustomId(`dorados-quitar-modal|${eventId}`)
            .setTitle("Quitar Usuario");

        const userInput = new TextInputBuilder()
            .setCustomId("user_id")
            .setLabel("Usuario (ID o mención)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ej: @usuario o 123456789")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(userInput)
        );

        return interaction.showModal(modal);
    }

    // ACCIÓN: CERRAR
    if (action === "cerrar") {
        if (interaction.user.id !== event.creatorId && !interaction.member.permissions.has("Administrator")) {
            return interaction.reply({ 
                content: "❌ Solo el creador de la party puede cerrarla.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        try {
            const logChannelId = await getLogChannel(interaction.guild.id);
            const logChannel = interaction.guild.channels.cache.get(logChannelId);

            if (logChannel) {
                const participantesTextRaw = Object.entries(event.roles)
                    .map(([role, userId]) => {
                        const emoji = ROLES[role.toUpperCase()] || "➖";
                        return `• ${emoji} ${role.toUpperCase()}: ${userId ? `<@${userId}>` : "Nadie"}`;
                    })
                    .join("\n");

                // Truncar si es muy largo
                const participantesText = participantesTextRaw.length > 900 
                    ? participantesTextRaw.substring(0, 900) + "..." 
                    : participantesTextRaw;

                const reportEmbed = new EmbedBuilder()
                    .setTitle("👑 EVENTO FINALIZADO: DORADOS BRECILIEN")
                    .setColor(COLORS.dorados)
                    .addFields(
                        { name: "CALLER", value: `<@${event.creatorId}>`, inline: true },
                        { name: "HORA", value: event.hora, inline: true },
                        { name: "PARTICIPANTES", value: participantesText || "Sin participantes" }
                    )
                    .setTimestamp()
                    .setFooter({ text: "World of Albion • Sistema de Partys" });

                await logChannel.send({ embeds: [reportEmbed] });
            }
        } catch (err) {
            log.error("Error en reporte dorados:", err);
        }

        const voiceChannel = interaction.guild.channels.cache.get(event.voiceChannelId);
        if (voiceChannel) await voiceChannel.delete().catch(() => null);
        activeEvents.delete(eventId);

        log.interaction('button', `dorados-cerrar`);
        return interaction.update({ 
            content: "🔒 Party de Dorados finalizada y registros limpiados.", 
            embeds: [], 
            components: [] 
        });
    }
}
