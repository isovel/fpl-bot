const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

module.exports = {
    customId: 'start-match',
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

        const c_matches = client.runtimeVariables.db.collection('matches');

        const match = await c_matches.findOne({
            division: division,
            msgId: interaction.message.id,
        });

        if (!match) {
            return interaction.reply({
                content: 'Match code not set.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (match.status == 1) {
            return interaction.reply({
                content: 'Match already started.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        //send dm to every pulled user
        const c_queues = client.runtimeVariables.db.collection('queues');

        const queue = await c_queues.findOne({
            division: division,
        });

        const users = queue.randomUsers;

        await users.forEach((user) => {
            client.users.fetch(user.id).then((u) => {
                if (!u)
                    return interaction.reply({
                        content: 'User not found.',
                        ephemeral: client.config.development.ephemeral,
                    });

                //if user doesnt have verified role
                if (!u.roles.cache.has(client.config.roles['fpl-verified'])) {
                    return interaction.reply({
                        content: `${u.displayName} is not yet verified.`,
                        ephemeral: client.config.development.ephemeral,
                    });
                }
                u.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Match')
                            .setDescription(
                                `The match code for the match in division ${division} is **${match.matchCode}**`
                            )
                            .setColor('Green'),
                    ],
                });
            });
        });

        c_matches.updateOne(
            {
                division: division,
                msgId: interaction.message.id,
            },
            {
                $set: {
                    status: 1,
                    users: users,
                },
            }
        );

        interaction.reply({
            content: 'Match started.',
            ephemeral: client.config.development.ephemeral,
        });
    },
};
