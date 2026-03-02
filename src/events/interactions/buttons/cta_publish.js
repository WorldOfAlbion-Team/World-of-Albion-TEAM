import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } from "discord.js";
import { ctaDrafts } from "../modals/cta_handle.js";
import { WEAPONS_DICT } from "../../../utils/items.js";
import { log } from "../../../utils/logger.js";

// Categorías a tipos de rol
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

// Emojis por tipo
const TYPE_EMOJIS = {
    TANKS: "🛡️",
    HEALS: "💚",
    SUPPORTS: "✨",
    DPS: "⚔️"
};

export default async function (interaction) {
    if (interaction.customId !== "cta_publish") return;

    const data = ctaDrafts.get(interaction.user.id);
    
    if (!data || data.roles.length === 0) {
        return interaction.reply({ content: "❌ Debes agregar al menos **1 rol** para publicar.", flags: 64 });
    }

    // Verificar permisos del bot
    const botMember = interaction.guild.members.me;
    const requiredPermissions = ["ViewChannel", "SendMessages", "EmbedLinks", "UseExternalEmojis", "ManageChannels", "ManageRoles"];
    const missingPermissions = requiredPermissions.filter(p => !botMember.permissions.has(p));
    
    if (missingPermissions.length > 0) {
        return interaction.reply({ 
            content: `❌ Faltan permisos: ${missingPermissions.join(", ")}`, 
            flags: 64 
        });
    }

    const targetChannel = await interaction.guild.channels.fetch(data.canalId).catch(() => interaction.channel);
    if (!targetChannel) {
        return interaction.reply({ content: "❌ No se encontró el canal de destino.", flags: 64 });
    }

    // Crear canal de voz con permisos restringidos
    let voiceChannel = null;
    try {
        voiceChannel = await interaction.guild.channels.create({
            name: `🔊 ${data.titulo}`,
            type: ChannelType.GuildVoice,
            parent: targetChannel.parentId,
            userLimit: Math.min(data.roles.length, 99),
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect]
                }
            ]
        });
    } catch (e) {
        log.error("Error creando canal de voz:", e);
        return interaction.reply({ content: "❌ Error al crear canal de voz.", flags: 64 });
    }

    // Organizar roles por tipo
    const groups = { TANKS: [], HEALS: [], SUPPORTS: [], DPS: [] };
    
    data.roles.forEach((rol, i) => {
        const linea = `**${i + 1}.** ${rol.emoji} ${rol.label} **(0/1)**`;
        const categoria = rol.value.split('_')[0].toUpperCase();
        const tipo = CATEGORY_TYPES[categoria] || "DPS";
        groups[tipo].push(linea);
    });

    // Construir embed
    const fields = [
        { name: "📍 Lugar", value: data.lugar, inline: true },
        { name: "⏰ Hora", value: data.hora, inline: true },
        { name: "🎙️ Voz", value: voiceChannel.toString(), inline: true }
    ];

    if (groups.TANKS.length > 0) fields.push({ name: "🛡️ TANKS", value: groups.TANKS.join("\n") || "Vacío", inline: true });
    if (groups.HEALS.length > 0) fields.push({ name: "💚 HEALS", value: groups.HEALS.join("\n") || "Vacío", inline: true });
    if (groups.SUPPORTS.length > 0) fields.push({ name: "✨ SUPPORTS", value: groups.SUPPORTS.join("\n") || "Vacío", inline: true });
    if (groups.DPS.length > 0) fields.push({ name: "⚔️ DPS", value: groups.DPS.join("\n") || "Vacío", inline: true });

    const embed = new EmbedBuilder()
        .setTitle(`🎯 ${data.titulo.toUpperCase()} 🎯`)
        .setColor("#e74c3c")
        .setDescription(`👑 **Caller:** <@${interaction.user.id}>\n📍 **Lugar:** ${data.lugar}\n⏰ **Hora:** ${data.hora}`)
        .addFields(fields)
        .setFooter({ text: "World of Albion • CTA", iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    if (data.descripcion.trim()) {
        embed.addFields({ name: "📝 Descripción", value: data.descripcion });
    }

    // Selector para unirse
    const options = data.roles.slice(0, 24).map((r, i) => ({ 
        label: `Puesto ${i+1}: ${r.label}`, 
        value: `${i}`, 
        emoji: r.emoji 
    }));
    options.push({ label: "Abandonar", value: "desanotarse", emoji: "❌" });

    const rowSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("cta_unirse")
            .setPlaceholder("Selecciona tu puesto...")
            .addOptions(options)
    );

    // Botones
    const rowBtns = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("cta_agregar").setLabel("➕ Agregar Usuario").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("cta_quitar").setLabel("➖ Quitar Usuario").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("cta_cerrar").setLabel("❌ Cerrar CTA").setStyle(ButtonStyle.Secondary)
    );

    // Enviar mensaje
    try {
        await targetChannel.send({ content: "@everyone", embeds: [embed], components: [rowSelect, rowBtns] });
    } catch (e) {
        log.error("Error enviando mensaje:", e);
        return interaction.reply({ content: "❌ Error al enviar el mensaje.", flags: 64 });
    }

    // Limpiar draft
    ctaDrafts.delete(interaction.user.id);
    
    await interaction.deleteReply().catch(() => null);
}
