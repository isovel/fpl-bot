const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');

module.exports = {
    customId: 'set-match-code',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {import('discord.js').AutocompleteInteraction} interaction
     */
    run: async (client, interaction) => {
        const division = interaction.customId.split('_')[1];
        const msgId = interaction.customId.split('_')[2];
        const matchCode = interaction.fields.getTextInputValue('match-code');

        const c_matches = client.runtimeVariables.db.collection('matches');

        const match = await c_matches.findOne({
            division: division,
            msgId: msgId,
        });

        if (match) {
            return interaction.reply({
                content: 'Match code already set.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (!matchCode.toUpperCase().match(/^[0-9A-Z]{4}$/)) {
            return interaction.reply({
                content: 'Invalid match code.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        c_matches.insertOne({
            division: division,
            msgId: msgId,
            matchCode: matchCode,
            status: 0,
        });

        interaction.reply({
            content: 'Match code set.',
            ephemeral: client.config.development.ephemeral,
        });

        /*send a message to every pulled user
        const c_queues = client.runtimeVariables.db.collection('queues');

        const queue = await c_queues.findOne({
            division: division,
        });

        const users = queue.randomUsers;

        users.forEach((user) => {
            client.users.fetch(user.id).then((u) => {
                u.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Match Code')
                            .setDescription(
                                `The match code for the match in division ${division} is: ${interaction.options.getString(
                                    'match-code'
                                )}`
                            )
                            .setColor('Green'),
                    ],
                });
            });
        });*/
    },
};
