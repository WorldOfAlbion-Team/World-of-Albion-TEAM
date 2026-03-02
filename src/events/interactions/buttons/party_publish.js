import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } from "discord.js";
import { partyConfigs, CATEGORIAS } from "../modals/armar_party_handle.js";
import { savePartyEvent } from "../../../database.js";
import { log } from "../../../utils/logger.js";

export default async function (interaction) {
    if (!interaction.customId.startsWith("party_publicar_")) return;

    const configId = interaction.customId.replace("party_publicar_", "");
    const config = partyConfigs.get(configId);

    if (!config) {
        return interaction.reply({ 
            content: "❌ Error: Configuración no encontrada.", 
            flags: 64 
        });
    }

    // Verificar que es el creador (solo el creador puede publicar)
    if (interaction.user.id !== config.creatorId) {
        return interaction.reply({ 
            content: "❌ Solo el creador puede publicar la party.", 
            flags: 64 
        });
    }

    // Nota: La validación de canal de voz se hace después de crear el canal

    const targetChannel = await interaction.guild.channels.fetch(config.canalId).catch(() => null);
    if (!targetChannel) {
        return interaction.reply({ 
            content: "❌ Canal de destino no encontrado.", 
            flags: 64 
        });
    }

    // Verificar permisos del bot
    const botMember = interaction.guild.members.me;
    if (!botMember) {
        return interaction.reply({ 
            content: "❌ Error: No puedo verificar permisos.", 
            flags: 64 
        });
    }

    const requiredPermissions = [
        "ViewChannel",
        "SendMessages",
        "EmbedLinks",
        "UseExternalEmojis",
        "ManageChannels",
        "ManageRoles"
    ];

    const missingPermissions = requiredPermissions.filter(p => !botMember.permissions.has(p));
    if (missingPermissions.length > 0) {
        return interaction.reply({ 
            content: `❌ Faltan permisos: ${missingPermissions.join(", ")}`, 
            flags: 64 
        });
    }

    // Crear canal de voz oculto
    let voiceChannel = null;
    let voiceChannelUrl = "Error al crear canal";
    
    try {
        const parentId = targetChannel.parentId;
        
        voiceChannel = await interaction.guild.channels.create({
            name: `🔊 ${config.titulo}`,
            type: ChannelType.GuildVoice,
            parent: parentId,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: botMember.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.ManageChannels
                    ]
                }
            ],
            userLimit: 10
        });
        voiceChannelUrl = `<#${voiceChannel.id}>`;
    } catch (e) {
        log.error("Error creando canal de voz:", e);
        voiceChannelUrl = "⚠️ Error creando canal";
    }

    // Construir campos del embed
    const fields = [
        { name: "🛡️ TIER", value: `\`${config.tier}\``, inline: true },
        { name: "📍 LUGAR", value: config.lugar, inline: true },
        { name: "⏰ HORA", value: `\`${config.hora}\``, inline: true },
        { name: "🎙️ VOZ", value: voiceChannelUrl, inline: false }
    ];

    // Obtener armas configuradas
    const armasConfiguradas = config.armas || new Map();

    // Construir lista de participantes por categoría con armas
    for (const cat of config.categorias) {
        const catInfo = CATEGORIAS[cat];
        const arma = armasConfiguradas.get(cat);
        const armaTexto = arma ? ` (${arma})` : "";
        
        const participantesCat = Array.from(config.participantes.entries())
            .filter(([_, p]) => p.categoria === cat)
            .map(([userId, p]) => {
                const armaMiembro = p.arma ? ` - ${p.arma}` : "";
                return `<@${userId}>${armaMiembro}`;
            });

        if (participantesCat.length > 0 || arma) {
            const value = [
                ...participantesCat,
                arma ? `🔒 [${arma}${armaTexto}]` : null
            ].filter(Boolean).join("\n") || "Vacío";
            
            fields.push({
                name: `${catInfo?.emoji || "•"} ${catInfo?.name || cat.toUpperCase()}${armaTexto}`,
                value: value,
                inline: true
            });
        }
    }

    // Si no hay participantes
    if (config.participantes.size === 0) {
        fields.push({
            name: "👥 PARTICIPANTES",
            value: "Sin participantes aún",
            inline: false
        });
    }

    // Embed final
    const tituloConEmojis = `<:WOA:1441970541517996114> ${config.titulo.toUpperCase()} <:WOA:1441970541517996114>`;
    
    const embedFinal = new EmbedBuilder()
        .setTitle(tituloConEmojis)
        .setColor("#D4AF37")
        .setDescription(`👑 **Líder:** <@${config.creatorId}>\n━━━━━━━━━━━━━━━━━━━━━━`)
        .addFields(fields)
        .setFooter({ 
            text: `World of Albion • Sistema de Partys`, 
            iconURL: interaction.guild.iconURL() 
        })
        .setTimestamp();

    // Crear opciones para select de unirse
    const opcionesUnirse = [];
    for (const cat of config.categorias) {
        const catInfo = CATEGORIAS[cat];
        const arma = armasConfiguradas.get(cat);
        opcionesUnirse.push({
            label: `${catInfo?.emoji} ${catInfo?.name}`,
            value: `unirse_${cat}`,
            description: arma ? `Con: ${arma}` : "Sin arma específica",
            emoji: catInfo?.emoji
        });
    }
    opcionesUnirse.push({ label: "❌ Salir de la party", value: "salir_party", emoji: "❌" });

    // Select para unirse
    const rowSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`unirse_party_${voiceChannel?.id || configId}`)
            .setPlaceholder("👥 Únete a la party...")
            .addOptions(opcionesUnirse)
    );

    // Botones de acción
    const rowBotones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`party_agregar_${voiceChannel?.id || configId}`)
            .setLabel("➕ Agregar Miembro")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`party_quitar_${voiceChannel?.id || configId}`)
            .setLabel("➖ Quitar Miembro")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`party_cerrar_${voiceChannel?.id || configId}`)
            .setLabel("🔒 Cerrar Party")
            .setStyle(ButtonStyle.Secondary)
    );

    try {
        const message = await targetChannel.send({ 
            content: "@everyone", 
            embeds: [embedFinal], 
            components: [rowSelect, rowBotones] 
        });

        // Guardar en base de datos
        const rolesData = Array.from(config.participantes.entries()).map(([userId, p]) => ({
            userId,
            categoria: p.categoria,
            arma: p.arma
        }));

        await savePartyEvent(
            message.id,
            interaction.guildId,
            targetChannel.id,
            voiceChannel?.id || null,
            config.titulo,
            config.tier,
            config.lugar,
            config.hora,
            "",
            "custom",
            config.creatorId,
            rolesData
        );

        // Limpiar configuración temporal
        partyConfigs.delete(configId);

        await interaction.reply({ 
            content: `✅ Party "${config.titulo}" publicada en <#${config.canalId}>`, 
            flags: 64 
        });

    } catch (e) {
        log.error("Error publicando party:", e);
        return interaction.reply({ 
            content: `❌ Error al publicar: ${e.message}`, 
            flags: 64 
        });
    }
};
