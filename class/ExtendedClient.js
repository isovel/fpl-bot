const {
    Client,
    Partials,
    Collection,
    GatewayIntentBits,
} = require('discord.js');
const config = process.env.PRODUCTION
    ? require('../server-config')
    : require('../config');
const commands = require('../handlers/commands');
const events = require('../handlers/events');
const { setupFunctions, log } = require('../functions');
const deploy = require('../handlers/deploy');
const { startClient } = require('../handlers/mongodb');
const components = require('../handlers/components');
const api = require('../handlers/api');
log(
    `Loading ${process.env.PRODUCTION ? 'Production' : 'Development'} Server`,
    'info'
);

module.exports = class extends Client {
    collection = {
        interactioncommands: new Collection(),
        prefixcommands: new Collection(),
        aliases: new Collection(),
        components: {
            buttons: new Collection(),
            selects: new Collection(),
            modals: new Collection(),
            autocomplete: new Collection(),
        },
    };
    applicationcommandsArray = [];
    runtimeVariables = {};
    config = config;

    /**
     * / / object / list to be used in a call to any of the methods of the object
     */
    constructor(dir) {
        super({
            intents: Object.keys(GatewayIntentBits).map((a) => {
                return GatewayIntentBits[a];
            }), // Every intent
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.User,
                Partials.ThreadMember,
            ],
            presence: {
                /*activities: [
                    {
                        name: 'something goes here',
                        type: 4,
                        state: 'FFL Bot',
                    },
                ],*/
            },
        });
        this.__dirname = dir;
    }

    start = async () => {
        commands(this);
        events(this);
        components(this);
        setupFunctions(this);
        api(this);

        // Set up the mongodb database.
        if (config.handler.mongodb.enabled)
            this.runtimeVariables.db = await startClient();

        //initialize runtime variables
        this.runtimeVariables.applicationSkips = [];

        await this.login(process.env.DISCORD_LOGIN || config.client.token);

        // deploy this config to the handler
        if (config.handler.deploy) deploy(this, config);
    };
};
