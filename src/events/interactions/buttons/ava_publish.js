import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType } from "discord.js";
import { avaDrafts } from "../modals/ava_handle.js";
import { log } from "../../../utils/logger.js";
import { saveAvaEvent } from "../../../database.js";
import { canInteractWithEvent } from "../../../utils/voiceChannelValidator.js";

// Mapeo de categorías a tipos de rol
const CATEGORY_TYPES = {
    SAGRADOS: "HEALS",
    GUANTES: "SUPPORTS",
    FUEGO: "DPS",
    NATURAL: "DPS",
    MAZAS: "TANKS",
    MARTILLOS: "TANKS",
    LANZAS: "TANKS",
    HACHAS: "TANKS",
    ESPADAS: "TANKS",
    HIELO: "DPS",
    DAGAS: "DPS",
    CAMBIAFORMAS: "DPS",
    MALDICIONES: "DPS",
    VARAS: "DPS",
    BALLESTAS: "DPS",
    ARCOS: "DPS",
    ARCANOS: "DPS"
};

export default async function (interaction) {
    if (interaction.customId !== "ava_publish") return;

    const data = avaDrafts.get(interaction.user.id);
    
    if (!data || data.rolesElegidos.length < 2 || data.rolesElegidos.length > 21) {
        return interaction.reply({ content: "❌ Debes agregar entre **2 y 21** puestos para publicar.", flags: 64 });
    }

    const targetChannel = await interaction.guild.channels.fetch(data.canalId).catch(() => interaction.channel);

    // Verificar permisos del bot
    if (!interaction.guild.members.me) {
        return interaction.reply({ content: "❌ Error: No puedo verificar mis permisos en el servidor.", flags: 64 });
    }

    const botMember = interaction.guild.members.me;
    const requiredPermissions = [
        "ViewChannel",
        "SendMessages",
        "EmbedLinks",
        "UseExternalEmojis",
        "ManageChannels",
        "MentionEveryone"
    ];

    const missingPermissions = requiredPermissions.filter(p => !botMember.permissions.has(p));
    if (missingPermissions.length > 0) {
        return interaction.reply({ 
            content: `❌ Faltan permisos: ${missingPermissions.join(", ")}`, 
            flags: 64 
        });
    }

    // Obtener el evento de la base de datos para validación de voz
    const eventData = {
        voiceChannelId: null,
        creatorId: interaction.user.id
    };

    // Verificar si debe validar canal de voz
    const event = data.voiceChannelId ? { voiceChannelId: data.voiceChannelId, creatorId: interaction.user.id } : null;
    if (event && !await canInteractWithEvent(interaction, event)) {
        return;
    }

    let voiceChannel = null;
    let voiceChannelUrl = "No disponible";
    try {
        voiceChannel = await interaction.guild.channels.create({
            name: `🔊 ${data.titulo}`,
            type: ChannelType.GuildVoice,
            parent: targetChannel.parentId,
            userLimit: Math.min(data.rolesElegidos.length, 99)
        });
        voiceChannelUrl = `<#${voiceChannel.id}>`;
    } catch (e) { 
        log.error("Error creando canal de voz (AVA):", e);
        voiceChannelUrl = "⚠️ Error Permisos (Voz)"; 
    }

    // Categorizar roles
    const groups = {
        CALLER: [],
        TANKS: [],
        HEALS: [],
        SUPPORTS: [],
        DPS: []
    };

    data.rolesElegidos.forEach((rol, i) => {
        const linea = `**${i + 1}.** ${rol.emoji} ${rol.label} **(0/1)**`;
        const categoria = rol.value.split('_')[0].toUpperCase();
        const tipo = CATEGORY_TYPES[categoria] || "DPS";
        
        if (tipo === "TANKS") groups.TANKS.push(linea);
        else if (tipo === "HEALS") groups.HEALS.push(linea);
        else if (tipo === "SUPPORTS") groups.SUPPORTS.push(linea);
        else groups.DPS.push(linea);
    });

    // Construir campos del embed por grupos
    const fields = [
        { name: "🛡️ TIER", value: `\`${data.tier}\``, inline: true },
        { name: "⏰ HORA", value: `\`${data.hora}\``, inline: true },
        { name: "\u200B", value: "\u200B", inline: true }
    ];

    // Agregar grupos al embed
    if (groups.TANKS.length > 0) {
        fields.push({ name: "🛡️ TANKS", value: groups.TANKS.join("\n") || "Vacío", inline: true });
    }
    if (groups.HEALS.length > 0) {
        fields.push({ name: "💚 HEALS", value: groups.HEALS.join("\n") || "Vacío", inline: true });
    }
    if (groups.SUPPORTS.length > 0) {
        fields.push({ name: "✨ SUPPORTS", value: groups.SUPPORTS.join("\n") || "Vacío", inline: true });
    }
    if (groups.DPS.length > 0) {
        fields.push({ name: "⚔️ DPS", value: groups.DPS.join("\n") || "Vacío", inline: false });
    }

    // Título con emojis
    const tituloConEmojis = `<:WOA:1441970541517996114> ${data.titulo.toUpperCase()} <:WOA:1441970541517996114>`;

    const embedFinal = new EmbedBuilder()
        .setTitle(tituloConEmojis)
        .setColor("#9b59b6")
        .setDescription(`>>> 🎙️ **Voz:** ${voiceChannelUrl}\n📍 **Lugar:** ${data.lugar}\n👑 **Líder:** <@${interaction.user.id}>\n━━━━━━━━━━━━━━━━━━━━━━`)
        .addFields(fields);

    if (data.descripcion.trim()) {
        embedFinal.addFields({ name: "📝 DESCRIPCIÓN", value: data.descripcion, inline: false });
    }

    embedFinal.setFooter({ 
        text: `World of Albion • Sistema de Partys AVA`, 
        iconURL: interaction.guild.iconURL() 
    }).setTimestamp();

    const options = data.rolesElegidos.slice(0, 24).map((r, i) => ({ 
        label: `Puesto ${i+1}: ${r.label}`, 
        value: `${i}`, 
        emoji: r.emoji 
    }));
    options.push({ label: "Abandonar Puesto", value: "desanotarse", emoji: "❌" });

    const rowSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("unirse_ava_select")
            .setPlaceholder("Selecciona tu puesto...")
            .addOptions(options)
    );

    const rowBtns = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("ava_salir").setLabel("Salir").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("ava_cerrar").setLabel("Cerrar Party").setStyle(ButtonStyle.Secondary)
    );

    try {
        const message = await targetChannel.send({ content: "@everyone", embeds: [embedFinal], components: [rowSelect, rowBtns] });
        
        // ── NUEVO: Crear hilo de coordinación ──────────────────────────────────────
        try {
            const hilo = await message.startThread({
                name: `💬 ${data.titulo.toUpperCase()} — Coordinación`,
                autoArchiveDuration: 1440, // 24 horas
                reason: `Hilo de coordinación para ${data.titulo}`
            });
            await hilo.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`💬 Hilo de Coordinación`)
                        .setColor("#9b59b6")
                        .setDescription(
                            `> 👑 **Líder:** <@${interaction.user.id}>\n` +
                            `> 🛡️ **Tier:** \`${data.tier}\`\n` +
                            `> 📍 **Lugar:** ${data.lugar}\n` +
                            `> ⏰ **Hora:** \`${data.hora}\`\n` +
                            `━━━━━━━━━━━━━━━━━━━━━━\n` +
                            `Usa este hilo para coordinar builds, estrategias y comunicarte con tu equipo.`
                        )
                        .setFooter({ text: "World of Albion • Hilo de Party" })
                        .setTimestamp()
                ]
            });
        } catch (threadErr) {
            log.error("Error creando hilo AVA:", threadErr);
            // No bloquear si falla el hilo
        }
        // ── FIN HILO ────────────────────────────────────────────────────────────────
        
        // Guardar evento en la base de datos
        await saveAvaEvent(
            message.id,
            interaction.guildId,
            targetChannel.id,
            voiceChannel?.id || null,
            data.titulo,
            data.tier,
            data.lugar,
            data.hora,
            data.descripcion || '',
            data.tipo,
            interaction.user.id,
            data.rolesElegidos
        );
    } catch (e) {
        log.error("Error enviando mensaje al canal (AVA):", e);
        return interaction.reply({ 
            content: `❌ Error al enviar el mensaje: ${e.message}`, 
            flags: 64 
        });
    }

    avaDrafts.delete(interaction.user.id);
    
    await interaction.deleteReply().catch(() => null);
};
