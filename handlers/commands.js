const { readdirSync } = require('fs');
const { log } = require('../functions');
const ExtendedClient = require('../class/ExtendedClient');

/**
 *
 * @param {ExtendedClient} client
 */
module.exports = (client) => {
    let loadedCommands = {};
    for (const type of readdirSync('./commands/')) {
        for (const dir of readdirSync('./commands/' + type)) {
            for (const file of readdirSync(
                './commands/' + type + '/' + dir
            ).filter((f) => f.endsWith('.js'))) {
                const module = require('../commands/' +
                    type +
                    '/' +
                    dir +
                    '/' +
                    file);

                if (!module) continue;

                if (type === 'prefix') {
                    if (!module.structure?.name || !module.run) {
                        log(
                            'Unable to load the command ' +
                                file +
                                " due to missing 'structure#name' or/and 'run' properties.",
                            'warn'
                        );

                        continue;
                    }

                    client.collection.prefixcommands.set(
                        module.structure.name,
                        module
                    );

                    if (
                        module.structure.aliases &&
                        Array.isArray(module.structure.aliases)
                    ) {
                        module.structure.aliases.forEach((alias) => {
                            client.collection.aliases.set(
                                alias,
                                module.structure.name
                            );
                        });
                    }
                } else {
                    if (!module.structure?.name || !module.run) {
                        log(
                            'Unable to load the command ' +
                                file +
                                " due to missing 'structure#name' or/and 'run' properties.",
                            'warn'
                        );

                        continue;
                    }

                    client.collection.interactioncommands.set(
                        module.structure.name,
                        module
                    );
                    client.applicationcommandsArray.push(module.structure);
                }

                if (!loadedCommands[dir]) loadedCommands[dir] = [];
                loadedCommands[dir].push(file);
            }
        }
    }
    //loaded x commands of type y
    Array.from(Object.keys(loadedCommands)).forEach((type) => {
        if (type == 'slash') {
        }
        log(
            `Loaded ${loadedCommands[type].length} command${
                loadedCommands[type].length > 1 ? 's' : ''
            } of type ${type}`,
            'info'
        );
    });
};
