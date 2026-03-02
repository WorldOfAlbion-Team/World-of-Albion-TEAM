// src/utils/embeder.js - Utilidades de embeds
import { EmbedBuilder } from 'discord.js';
import { getColor } from './colors.js';

export function truncateText(text, maxLength = 900, suffix = '...') {
    if (!text || typeof text !== 'string') return '';
    return text.length > maxLength ? text.substring(0, maxLength) + suffix : text;
}

export function parseCombinedField(fieldValue, index = 0) {
    if (!fieldValue || typeof fieldValue !== 'string') return '';
    return fieldValue.split('|')[index]?.trim() || '';
}

export function createEmbed(options = {}) {
    const { title = '', description = '', colorType = 'albion', thumbnail = null, image = null, fields = [], footer = true, timestamp = true, author = null } = options;
    const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor(getColor(colorType));
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (image) embed.setImage(image);
    if (fields.length > 0) embed.addFields(fields);
    if (footer) embed.setFooter({ text: 'World of Albion • Sistema de Albion Online' });
    if (timestamp) embed.setTimestamp();
    if (author) embed.setAuthor(author);
    return embed;
}

export function successEmbed(title, description = '') {
    return createEmbed({ title: `✅ ${title}`, description, colorType: 'success' });
}

export function errorEmbed(title, description = '') {
    return createEmbed({ title: `❌ ${title}`, description, colorType: 'error' });
}

export function infoEmbed(title, description = '') {
    return createEmbed({ title: `ℹ️ ${title}`, description, colorType: 'info' });
}

export function warningEmbed(title, description = '') {
    return createEmbed({ title: `⚠️ ${title}`, description, colorType: 'warning' });
}

export function partyEmbed(options = {}) {
    const { titulo, lider, lugar, hora, tier, voz = null, colorType = 'dorados' } = options;
    const embed = createEmbed({ title: `🎮 ${titulo}`, colorType });
    embed.setDescription(`👑 **Líder:** <@${lider}>`);
    if (lugar) embed.addFields({ name: '📍 Lugar', value: lugar, inline: true });
    if (hora) embed.addFields({ name: '⏰ Hora', value: hora, inline: true });
    if (tier) embed.addFields({ name: '🛡️ Tier', value: `\`${tier}\``, inline: true });
    if (voz) embed.addFields({ name: '🔊 Voz', value: voz, inline: false });
    return embed;
}

export function statsEmbed(stats) {
    const embed = createEmbed({ title: '📊 Estadísticas', colorType: 'info' });
    embed.addFields(Object.entries(stats).map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: String(v), inline: true })));
    return embed;
}

export default { createEmbed, successEmbed, errorEmbed, infoEmbed, warningEmbed, partyEmbed, statsEmbed, truncateText, parseCombinedField };
