const {} = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const userReveal = require('../../handlers/userReveal');

module.exports = {
    customId: 'start-web-server',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {*} interaction
     */
    run: async (client, interaction) => {
        const users = interaction.customId.split('_').slice(1);

        let url = await userReveal.startWebServer(users);

        interaction.reply({
            content: `Server started on ${url}`,
            ephemeral: client.config.development.ephemeral,
        });
    },
};
