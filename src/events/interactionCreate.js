// src/events/interactionCreate.js — Router central de interacciones
import { Events, MessageFlags, PermissionFlagsBits, InteractionType } from "discord.js";
import { OWNER_ID, OWNER_ONLY_COMMANDS } from "../config.js";
import { isGuildWhitelisted, getAllowedRoles } from "../database.js";
import { log } from "../utils/logger.js";
import { errorEmbed } from "../utils/embeder.js";

const MODAL_HANDLERS = {
    'modal_armar_party':          () => import('./interactions/modals/armar_party_handle.js'),
    'modal_ava':                  () => import('./interactions/modals/ava_handle.js'),
    'modal_cta':                  () => import('./interactions/modals/cta_handle.js'),
    'modal_agregar_usuario':      () => import('./interactions/modals/cta_agregar_handle.js'),
    'modal_quitar_usuario':       () => import('./interactions/modals/cta_quitar_handle.js'),
    'modal_guardar_plantilla':    () => import('./interactions/modals/plantilla_guardar_handle.js'),
    'modal_guardar_plantilla_party': () => import('./interactions/modals/party_guardar_plantilla_handle.js'),
    'modal_agregar_miembro_':     () => import('./interactions/modals/party_member_handle.js'),
    'modal_quitar_miembro_':      () => import('./interactions/modals/party_member_handle.js'),
    'modal_plantilla_':           () => import('./interactions/modals/plantilla_handle.js'),
    'modal_editar_':              () => import('./interactions/modals/plantilla_editar_handle.js'),
};

const BUTTON_HANDLERS = {
    'dorados':                  { type: 'buttons', file: 'button-dorados.js' },
    'dorados-select':           { type: 'selects', file: 'select-dorados.js' },
    'grupales':                 { type: 'buttons', file: 'button-grupales.js' },
    'grupales-select':          { type: 'selects', file: 'select-grupales.js' },
    'cta_publish':              { file: 'cta_publish.js' },
    'cta_cancel':               { file: 'cta_cancel.js' },
    'cta_undo':                 { file: 'cta_undo.js' },
    'cta_agregar':              { file: 'cta_agregar.js' },
    'cta_quitar':               { file: 'cta_quitar.js' },
    'cta_cerrar':               { file: 'cta_cerrar.js' },
    'cta_add_category':         { type: 'selects', file: 'cta_add_category.js' },
    'cta_add_weapon':           { type: 'selects', file: 'cta_add_weapon.js' },
    'cta_unirse':               { type: 'selects', file: 'cta_unirse.js' },
    'party_publish':            { file: 'party_publish.js' },
    'party_agregar':            { file: 'party_agregar.js' },
    'party_quitar':             { file: 'party_quitar.js' },
    'party_cerrar':             { file: 'party_cerrar.js' },
    'party_salir':              { file: 'party_salir.js' },
    'party_cancel':             { file: 'party_cancel.js' },
    'party_undo':               { file: 'party_undo.js' },
    'party_guardar_plantilla':  { file: 'party_guardar_plantilla.js' },
    'party_add_category':       { type: 'selects', file: 'party_add_category.js' },
    'party_add_weapon':         { type: 'selects', file: 'party_add_weapon.js' },
    'ava_add_category':         { type: 'selects', file: 'ava_add_category.js' },
    'ava_add_weapon':           { type: 'selects', file: 'ava_add_weapon.js' },
    'ava_publish':              { file: 'ava_publish.js' },
    'ava_salir':                { file: 'ava_salir.js' },
    'ava_cerrar':               { file: 'ava_cerrar.js' },
    'ava_cancel':               { file: 'ava_cancel.js' },
    'ava_undo':                 { file: 'ava_undo.js' },
    'unirse_ava_select':        { type: 'selects', file: 'unirse_ava_select.js' },
    'unirse_party_select':      { type: 'selects', file: 'unirse_party_select.js' },
    'seleccionar_arma':         { type: 'selects', file: 'seleccionar_arma.js' },
    'arma_':                    { type: 'selects', file: 'arma_select.js' },
    'select_eliminar_plantilla':{ type: 'selects', file: 'plantilla_eliminar_handle.js' },
    'plantillas_rapidas_select':{ type: 'selects', file: 'plantillas_rapidas.js' },
};

export default { name: Events.InteractionCreate, async execute(interaction) {
    try {
        if (interaction.isAutocomplete())                                        return handleAutocomplete(interaction);
        if (interaction.type === InteractionType.ModalSubmit)                    return handleModalSubmit(interaction);
        if (interaction.isButton() || interaction.isStringSelectMenu())          return handleButtonOrSelect(interaction);
        if (interaction.isChatInputCommand())                                    return handleSlashCommand(interaction);
    } catch (error) { log.error('interactionCreate', error); }
}};

// ─────────────────────────────────────────────
async function handleAutocomplete(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command?.autocomplete) return;
    try { await command.autocomplete(interaction); }
    catch (error) { log.error('autocomplete', error); }
}

async function handleModalSubmit(interaction) {
    const customId = interaction.customId;
    if (customId.startsWith('dorados-')) return loadAndExecute('./interactions/modals/dorados_handle.js', interaction);
    if (customId.startsWith('grupales-')) return loadAndExecute('./interactions/modals/grupales_handle.js', interaction);
    for (const [prefix, handler] of Object.entries(MODAL_HANDLERS)) {
        if (customId.startsWith(prefix)) return loadAndExecuteHandler(handler, interaction);
    }
}

async function handleButtonOrSelect(interaction) {
    const customId = interaction.customId;
    const isButton = interaction.isButton();
    const actionPrefix = customId.split('|')[0];
    for (const [prefix, handler] of Object.entries(BUTTON_HANDLERS)) {
        if (actionPrefix === prefix || actionPrefix.startsWith(prefix) || customId.startsWith(prefix)) {
            const folder = handler.type || (isButton ? 'buttons' : 'selects');
            return loadAndExecute(`./interactions/${folder}/${handler.file}`, interaction);
        }
    }
}

async function handleSlashCommand(interaction) {
    const { commandName, guildId, user, member } = interaction;
    const command = interaction.client.commands.get(commandName);
    if (!command) return;

    // Owner bypass total
    if (user.id === OWNER_ID) return command.execute(interaction);

    // Comandos solo owner
    if (OWNER_ONLY_COMMANDS.includes(commandName)) {
        return interaction.reply({ content: '❌ Acceso restringido al Desarrollador.', flags: MessageFlags.Ephemeral });
    }

    // Comandos públicos sin restricción
    const publicCommands = ['ping', 'info', 'server', 'azar'];
    if (publicCommands.includes(commandName)) return command.execute(interaction);

    // Verificar whitelist del servidor
    const whitelisted = await isGuildWhitelisted(guildId);
    if (!whitelisted) {
        return interaction.reply({
            embeds: [errorEmbed('Servidor no autorizado', 'Este servidor no está en la whitelist de WOA.\nContacta al desarrollador para solicitar acceso.')],
            flags: MessageFlags.Ephemeral
        });
    }

    // Comandos de party/eventos: verificar rol permitido
    const partyCommands = ['party_dorados', 'party_grupales', 'armar_party', 'ava', 'cta',
        'plantillas', 'plantilla_usar', 'plantilla_guardar', 'plantilla_crear',
        'plantilla_editar', 'plantilla_list', 'plantillas_guardadas', 'eventos_activos'];
    if (partyCommands.includes(commandName)) {
        const allowedRoleIds = await getAllowedRoles(guildId);
        const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
        const hasRole = allowedRoleIds.length === 0 || member.roles.cache.some(r => allowedRoleIds.includes(r.id));
        if (!hasRole && !isAdmin) {
            return interaction.reply({
                embeds: [errorEmbed('Sin permiso', 'Necesitas un rol autorizado o ser Administrador.\nPide a un admin que use `/allow_role`.')],
                flags: MessageFlags.Ephemeral
            });
        }
    }

    return command.execute(interaction);
}

async function loadAndExecute(relativePath, interaction) {
    try {
        const absoluteUrl = new URL(relativePath, import.meta.url);
        const handler = await import(absoluteUrl);
        return handler.default(interaction);
    } catch (error) {
        log.error('handler', error);
        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({ embeds: [errorEmbed('Error', 'Ocurrió un error al procesar la acción.')], flags: MessageFlags.Ephemeral });
        }
    }
}

async function loadAndExecuteHandler(handlerFn, interaction) {
    try {
        const handler = await handlerFn();
        return handler.default(interaction);
    } catch (error) {
        log.error('handler', error);
        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({ embeds: [errorEmbed('Error', 'Ocurrió un error al procesar el formulario.')], flags: MessageFlags.Ephemeral });
        }
    }
}
