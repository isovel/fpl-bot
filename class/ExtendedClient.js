const { Client, Partials, Collection } = require('discord.js');
const config = process.env.PRODUCTION
    ? require('../server-config')
    : require('../config');
const commands = require('../handlers/commands');
const events = require('../handlers/events');
const { setupFunctions, log } = require('../functions');
const deploy = require('../handlers/deploy');
const mongodb = require('../handlers/mongodb');
const components = require('../handlers/components');
const { generatHelpPages } = require('../handlers/help-command');
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
    constructor() {
        super({
            intents: 3276799, // Every intent
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
    }

    start = async () => {
        commands(this);
        events(this);
        components(this);
        setupFunctions(this);

        // Set up the mongodb database.
        if (config.handler.mongodb.enabled)
            this.runtimeVariables.db = (await mongodb()).db(config.db.name);

        //initialize runtime variables
        this.runtimeVariables.applicationSkips = [];

        await this.login(process.env.DISCORD_LOGIN || config.client.token);

        // deploy this config to the handler
        if (config.handler.deploy) deploy(this, config);
    };
};
