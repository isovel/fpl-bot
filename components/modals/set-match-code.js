const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const notificationHandler = require('../../handlers/notifications');
const { log } = require('../../functions');

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

        if (!matchCode.toUpperCase().match(/^[0-9A-Z]{4}$/)) {
            return interaction.reply({
                content: 'Invalid match code.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (match) {
            //update match code
            c_matches.updateOne(
                {
                    division: division,
                    msgId: msgId,
                },
                {
                    $set: {
                        matchCode: matchCode,
                    },
                }
            );

            await notificationHandler.notifyUser(
                interaction,
                match.users.map((u) => u.id),
                'matchCodeUpdated',
                {
                    division: division,
                    matchCode: matchCode,
                }
            );

            await interaction.reply({
                content: 'Match code updated (and users informed).',
                ephemeral: client.config.development.ephemeral,
            });
            return;
        }

        const c_queues = client.runtimeVariables.db.collection('queues');

        const queue = await c_queues.findOne({
            division: division,
        });

        const users = queue.randomUsers;

        c_matches
            .insertOne({
                division: division,
                msgId: msgId,
                matchCode: matchCode,
                users: users,
                status: 0,
            })
            .then((result) => {
                console.log('result', result);

                notificationHandler.notifyUser(
                    interaction,
                    users.map((u) => u.id),
                    'matchCodeSet',
                    {
                        division: division,
                        matchCode: matchCode,
                    }
                );

                interaction.reply({
                    content: 'Match code set (and users informed).',
                    ephemeral: client.config.development.ephemeral,
                });
            })
            .catch((err) => {
                log(err, 'err');
                interaction.reply({
                    content: 'An error occurred.',
                    ephemeral: client.config.development.ephemeral,
                });
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
