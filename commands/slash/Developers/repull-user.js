const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('repull-user')
        .setDescription('Repull a specific user.')
        .addUserOption((opt) =>
            opt.setName('user').setDescription('The user.').setRequired(true)
        ),
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const user = interaction.options.getUser('user');

        const c_users = client.runtimeVariables.db.collection('users');

        const userData = await c_users.findOne({ discordId: user.id });

        const c_queues = client.runtimeVariables.db.collection('queues');

        let queueData = await c_queues.findOne({
            division: userData.division,
        });

        if (!queueData) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('Queue not found in the database.')
                        .setColor('Red'),
                ],
            });
        }

        if (
            !(queueData.randomUsers.filter((u) => u.id === user.id).length > 0)
        ) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('User not found in the queue.')
                        .setColor('Red'),
                ],
            });
        }

        //pull new random user from queue.users
        let randomUser;
        while (!randomUser) {
            randomUser =
                queueData.users[
                    Math.floor(Math.random() * queueData.users.length)
                ];
            if (
                queueData.randomUsers.filter((u) => u.id === randomUser.id)
                    .length > 0
            ) {
                randomUser = null;
            }
        }

        queueData.randomUsers.push(randomUser);

        c_queues
            .updateOne(
                { division: userData.division },
                {
                    $addToSet: { randomUsers: randomUser },
                }
            )
            .then(async () => {
                await c_queues.updateOne(
                    { division: userData.division },
                    {
                        $pull: { randomUsers: { id: user.id } },
                    }
                );
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success')
                            .setDescription(
                                `User ${user.displayName} has been repulled to ${randomUser.name}.`
                            )
                            .setColor('Green'),
                    ],
                });
            })
            .catch((err) => {
                log(err, 'err');
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                'An error occurred while writing to the databse.'
                            )
                            .setColor('Red'),
                    ],
                });
            });
    },
};
