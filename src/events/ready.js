import { logger } from '../utils/logger.js';

export default {
    name: 'ready',
    once: true,
    execute(client) {
        logger.info(`✅ Bot conectado como ${client.user.tag}`);
        logger.info(`📊 Conectado a ${client.guilds.cache.size} servidores`);
        
        // Establecer actividad del bot
        client.user.setActivity('World of Albion', { type: 'PLAYING' });
    }
};