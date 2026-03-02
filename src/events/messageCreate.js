import { Events, ChannelType } from "discord.js";

// REEMPLAZA CON TU ID DE DISCORD
const OWNER_ID = "1074466114811215882"; 

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // Si el bot recibe un mensaje privado
        if (message.channel.type === ChannelType.DM) {
            const owner = await message.client.users.fetch(OWNER_ID);
            if (!owner) return;

            await owner.send({
                content: `📩 **Nuevo mensaje de:** ${message.author.tag} (\`${message.author.id}\`)\n\n> ${message.content}\n\n*Para responder usa:* \`/reply usuario_id: ${message.author.id} mensaje: tu respuesta\``
            });
        }
    },
};