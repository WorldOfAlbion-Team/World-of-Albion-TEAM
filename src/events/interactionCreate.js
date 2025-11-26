import { Events } from "discord.js";
import { logger } from "../utils/logger.js";

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                return interaction.reply({ content: "❌ Comando no encontrado.", flags: [64] });
            }

            try {
                await command.execute(interaction);
            } catch (err) {
                logger.error(`❌ Error ejecutando comando: ${err.message}`);
                logger.error(err.stack);
                return interaction.reply({ content: `❌ Error ejecutando el comando: ${err.message}`, flags: [64] });
            }
        }

        if (interaction.isButton()) {
            const { customId } = interaction;
            try {
                if (customId.startsWith("dorados-")) {
                    const file = await import(`${process.cwd()}/src/events/interactions/buttons/button-dorados.js`);
                    return file.default(interaction);
                }
                if (customId.startsWith("grupales-")) {
                    const file = await import(`${process.cwd()}/src/events/interactions/buttons/button-grupales.js`);
                    return file.default(interaction);
                }
            } catch (error) {
                logger.error(`❌ Error procesando botón: ${error.message}`);
                logger.error(error.stack);
                return interaction.reply({ content: `❌ Error procesando el botón: ${error.message}`, flags: [64] });
            }
        }

        if (interaction.isStringSelectMenu()) {
            const { customId } = interaction;
            try {
                if (customId.startsWith("dorados-select")) {
                    const file = await import(`${process.cwd()}/src/events/interactions/selects/select-dorados.js`);
                    return file.default(interaction);
                }
                if (customId.startsWith("grupales-select")) {
                    const file = await import(`${process.cwd()}/src/events/interactions/selects/select-grupales.js`);
                    return file.default(interaction);
                }
            } catch (error) {
                logger.error(`❌ Error procesando dropdown: ${error.message}`);
                logger.error(error.stack);
                return interaction.reply({ content: `❌ Error procesando el selector: ${error.message}`, flags: [64] });
            }
        }
    }
};