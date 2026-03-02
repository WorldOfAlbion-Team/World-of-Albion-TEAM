import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { log } from '../../utils/logger.js';
import { COLORS } from '../../utils/colors.js';
import { ROLES, FACCIONES } from '../../constants/emojis.js';

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export default {
    data: new SlashCommandBuilder()
        .setName('azar')
        .setDescription('Genera un elemento aleatorio de Albion Online')
        .addSubcommand(s => s.setName('rol').setDescription('Rol aleatorio para tu próxima actividad'))
        .addSubcommand(s => s.setName('faccion').setDescription('Facción aleatoria'))
        .addSubcommand(s => s.setName('actividad').setDescription('Actividad aleatoria para hacer hoy')),

    async execute(interaction) {
        log.command('azar', interaction.user.id, interaction.guildId);
        const sub = interaction.options.getSubcommand();

        if (sub === 'rol') {
            const roles = [
                { name: 'Tank',    emoji: ROLES.TANK,  desc: 'Aguanta el daño y protege al grupo' },
                { name: 'Heal',    emoji: ROLES.HEAL,  desc: 'Mantiene vivo al equipo' },
                { name: 'DPS',     emoji: ROLES.DPS,   desc: 'Máximo daño al objetivo' },
                { name: 'Flami',   emoji: ROLES.FLAMI, desc: 'Control de zona con fuego' },
                { name: 'Maldi',   emoji: ROLES.MALDI, desc: 'Debuffs y control de enemigos' },
                { name: 'SC',      emoji: ROLES.SC,    desc: 'Daño de área masivo' },
                { name: 'Badon',   emoji: ROLES.BADON, desc: 'Daño a distancia y movilidad' },
            ];
            const r = pick(roles);
            const embed = new EmbedBuilder()
                .setTitle('🎲 Rol Aleatorio')
                .setColor(COLORS.dorados)
                .setDescription(`> Tu destino ha sido decidido por el azar de Albion`)
                .addFields(
                    { name: 'Rol asignado', value: `${r.emoji} **${r.name}**`, inline: true },
                    { name: 'Función',      value: r.desc, inline: true }
                )
                .setFooter({ text: 'World of Albion • /azar rol' })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'faccion') {
            const facciones = [
                { name: 'Martlock',      emoji: FACCIONES.MARTLOCK },
                { name: 'Thetford',      emoji: FACCIONES.THETFORD },
                { name: 'Fort Sterling', emoji: FACCIONES.FORT_STERLING },
                { name: 'Lymhurst',      emoji: FACCIONES.LYMHURST },
                { name: 'Bridgewatch',   emoji: FACCIONES.BRIDGEWATCH },
                { name: 'Caerleon',      emoji: FACCIONES.CAERLEON },
            ];
            const f = pick(facciones);
            const embed = new EmbedBuilder()
                .setTitle('🎲 Facción Aleatoria')
                .setColor(COLORS.faction)
                .setDescription('> Las estrellas han decidido tu facción para hoy')
                .addFields({ name: 'Facción', value: `${f.emoji} **${f.name}**`, inline: true })
                .setFooter({ text: 'World of Albion • /azar faccion' })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'actividad') {
            const actividades = [
                { name: 'Zona Abierta',       emoji: '🌍', desc: 'Farming en mundo abierto con facción' },
                { name: 'Crystal League',      emoji: '💎', desc: 'Combate 5v5 en Crystal League' },
                { name: 'Mists',               emoji: '🌫️', desc: 'Aventura en las Nieblas' },
                { name: 'Corrupted Dungeon',   emoji: '💀', desc: 'Mazmorra corrompida 1v1' },
                { name: 'Avalonian Road',      emoji: '⚔️', desc: 'Caminos avalonianos en grupo' },
                { name: 'Gathering',           emoji: '🌿', desc: 'Recolección de recursos' },
                { name: 'Crafting',            emoji: '🔨', desc: 'Craftear y mejorar equipo' },
                { name: 'Hellgate',            emoji: '🔥', desc: 'Hellgate con tu grupo' },
            ];
            const a = pick(actividades);
            const embed = new EmbedBuilder()
                .setTitle('🎲 Actividad del Día')
                .setColor(COLORS.primary)
                .setDescription('> Albion ha elegido tu misión de hoy')
                .addFields(
                    { name: 'Actividad', value: `${a.emoji} **${a.name}**`, inline: true },
                    { name: 'Info',      value: a.desc, inline: true }
                )
                .setFooter({ text: 'World of Albion • /azar actividad' })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }
    }
};
