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
        const division = interaction.customId.split('_')[1];

        //check if web server is already running
        if (userReveal.isWebServerRunning()) {
            return interaction.reply({
                content: 'Web server is already running.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        const c_queues = client.runtimeVariables.db.collection('queues');

        const queueData = await c_queues.findOne({
            division: division,
        });

        if (!queueData?.randomUsers?.length) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('Queue not found in the database.')
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        const users = queueData.randomUsers.map((u) => u.name);

        let url = await userReveal.startWebServer(users);

        interaction.reply({
            content: `Server started on ${url}`,
            ephemeral: client.config.development.ephemeral,
        });
    },
};
