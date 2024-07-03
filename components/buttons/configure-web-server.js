const {} = require('discord.js');

module.exports = {
    customId: 'configure-web-server',
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        const division = interaction.customId.split('_')[1];

        if (client.runtimeVariables.users) {
            return interaction.reply({
                content: 'Web server is already configured.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        const c_queues = client.runtimeVariables.db.collection('queues');

        const queueData = await c_queues.findOne({
            division: division,
        });

        if (!queueData?.randomUsers?.length) {
            return interaction.reply({
                content: 'Queue not found in the database.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        const users = queueData.randomUsers.map((u) => u.name);

        client.runtimeVariables.users = users;

        interaction.reply({
            content: `Server configured for users`,
            ephemeral: client.config.development.ephemeral,
        });
    },
};
