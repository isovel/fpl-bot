const { readdirSync } = require('fs');
const { log } = require('../functions');
const ExtendedClient = require('../class/ExtendedClient');

/**
 *
 * @param {ExtendedClient} client
 */
module.exports = (client) => {
    let loadedComponents = [];
    for (const dir of readdirSync('./components/')) {
        for (const file of readdirSync('./components/' + dir).filter((f) =>
            f.endsWith('.js')
        )) {
            const module = require('../components/' + dir + '/' + file);

            if (!module) continue;

            if (dir === 'buttons') {
                if (!module.customId || !module.run) {
                    log(
                        'Unable to load the component ' +
                            file +
                            " due to missing 'structure#customId' or/and 'run' properties.",
                        'warn'
                    );

                    continue;
                }

                client.collection.components.buttons.set(
                    module.customId,
                    module
                );

                loadedComponents.push({
                    type: 'button',
                    customId: module.customId,
                    file: file,
                });
            } else if (dir === 'selects') {
                if (!module.customId || !module.run) {
                    log(
                        'Unable to load the select menu ' +
                            file +
                            " due to missing 'structure#customId' or/and 'run' properties.",
                        'warn'
                    );

                    continue;
                }

                client.collection.components.selects.set(
                    module.customId,
                    module
                );

                loadedComponents.push({
                    type: 'select',
                    customId: module.customId,
                    file: file,
                });
            } else if (dir === 'modals') {
                if (!module.customId || !module.run) {
                    log(
                        'Unable to load the modal ' +
                            file +
                            " due to missing 'structure#customId' or/and 'run' properties.",
                        'warn'
                    );

                    continue;
                }

                client.collection.components.modals.set(
                    module.customId,
                    module
                );

                loadedComponents.push({
                    type: 'modal',
                    customId: module.customId,
                    file: file,
                });
            } else if (dir === 'autocomplete') {
                if (!module.commandName || !module.run) {
                    log(
                        `Unable to load the autocomplete component ${file} due to missing 'commandName' or 'run' properties.`,
                        'warn'
                    );
                    continue;
                }

                client.collection.components.autocomplete.set(
                    module.commandName,
                    module
                );

                loadedComponents.push({
                    type: 'autocomplete',
                    commandName: module.commandName,
                    file: file,
                });
            } else {
                log(`Invalid component type: ${file}`, 'warn');
            }
        }
    }
    //for every unique type of component log all loaded
    let uniqueTypes = [...new Set(loadedComponents.map((item) => item.type))];
    for (const type of uniqueTypes) {
        let typeComponents = loadedComponents.filter(
            (item) => item.type === type
        );
        log(
            `Loaded ${typeComponents.length} ${type} component${
                typeComponents.length > 1 ? 's' : ''
            }`,
            'info'
        );
    }
};
