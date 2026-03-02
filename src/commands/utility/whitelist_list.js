import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";
import { getWhitelistedGuilds } from "../../database.js";
import { logger } from "../../utils/logger.js";

export default {
    data: new SlashCommandBuilder()
        .setName("whitelist_list")
        .setDescription("Muestra la lista de servidores autorizados")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const dbGuilds = await getWhitelistedGuilds();

            if (!dbGuilds || dbGuilds.length === 0) {
                return interaction.reply({ 
                    content: "⚠️ No hay servidores en la whitelist.", 
                    flags: MessageFlags.Ephemeral 
                });
            }

            // Mapeamos los resultados para obtener el nombre desde el cache del bot
            const listaPromesa = dbGuilds.map(async (dbGuild) => {
                const guildId = dbGuild.guild_id; // Acceso correcto a la propiedad
                const guild = interaction.client.guilds.cache.get(guildId);
                const guildName = guild ? guild.name : "Nombre no disponible (Bot fuera)";
                
                return `• **${guildName}** (ID: \`${guildId}\`)`;
            });

            const listaFormateada = (await Promise.all(listaPromesa)).join("\n");

            return interaction.reply({ 
                content: `**🛡️ Servidores autorizados:**\n${listaFormateada}`, 
                flags: MessageFlags.Ephemeral 
            });

        } catch (error) {
            logger.error(`Error en whitelist_list: ${error.message}`);
            return interaction.reply({ content: "❌ Error al obtener la lista.", flags: MessageFlags.Ephemeral });
        }
    }
};