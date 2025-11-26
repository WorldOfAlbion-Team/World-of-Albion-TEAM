import { EmbedBuilder } from 'discord.js';
import { getColor } from './colors.js';

export function createEmbed(title, description, colorType = 'albion') {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(getColor(colorType))
        .setTimestamp();
}