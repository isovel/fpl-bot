const {} = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const userReveal = require('../../handlers/userReveal');
const { log } = require('../../functions');

module.exports = {
    customId: 'stop-web-server',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {*} interaction
     */
    run: async (client, interaction) => {
        log('Stopping web server...', 'info');
        let stopped = userReveal.stopWebServer();
        log(
            stopped ? 'Web server stopped.' : 'Web server is already stopped.',
            'debug'
        );
        if (stopped)
            interaction.reply({
                content: `Web server stopped.`,
                ephemeral: client.config.development.ephemeral,
            });
        else
            interaction.reply({
                content: `Web server is already stopped.`,
                ephemeral: client.config.development.ephemeral,
            });
    },
};
