const { readdirSync } = require('fs');
const { log } = require('../functions');
const ExtendedClient = require('../class/ExtendedClient');

/**
 *
 * @param {ExtendedClient} client
 */
module.exports = (client) => {
    let loadedEvents = {};
    for (const dir of readdirSync('./events/')) {
        for (const file of readdirSync('./events/' + dir).filter((f) =>
            f.endsWith('.js')
        )) {
            const module = require('../events/' + dir + '/' + file);

            if (!module) continue;

            if (!module.event || !module.run) {
                log(
                    'Unable to load the event ' +
                        file +
                        " due to missing 'name' or/and 'run' properties.",
                    'warn'
                );

                continue;
            }

            if (!loadedEvents[dir]) loadedEvents[dir] = [];
            loadedEvents[dir].push(file);

            if (module.once) {
                client.once(module.event, (...args) =>
                    module.run(client, ...args)
                );
            } else {
                client.on(module.event, (...args) =>
                    module.run(client, ...args)
                );
            }
        }
    }
    Array.from(Object.keys(loadedEvents)).forEach((dir) => {
        log(
            `Loaded ${loadedEvents[dir].length} event${
                loadedEvents[dir].length > 1 ? 's' : ''
            } for ${dir}.`,
            'info'
        );
    });
};
