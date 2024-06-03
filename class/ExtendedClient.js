console.log('Loading DiscordJs...');
const { Client, Partials, Collection } = require('discord.js');
console.log('Loading Handlers...');
const config = require('../config');
const commands = require('../handlers/commands');
const events = require('../handlers/events');
const { setupFunctions } = require('../functions');
const deploy = require('../handlers/deploy');
const mongodb = require('../handlers/mongodb');
const components = require('../handlers/components');

console.log('Handlers loaded!');

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

        if (config.handler.mongodb.enabled)
            this.runtimeVariables.db = (await mongodb()).db('FFL-Bot');

        await this.login(process.env.DISCORD_LOGIN || config.client.token);

        if (config.handler.deploy) deploy(this, config);
    };
};
