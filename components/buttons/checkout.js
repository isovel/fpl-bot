const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

module.exports = {
    customId: 'checkout',
    options: {
        public: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {*} interaction
     */
    run: async (client, interaction) => {
        let division = interaction.customId.split('_')[1];

        //get user
        let user = await client.runtimeVariables.db
            .collection('users')
            .findOne({ discordId: interaction.user.id })
            .catch((error) => {
                log(error, 'err');
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                'An error occurred while checking you out.'
                            )
                            .setColor('Red'),
                    ],
                    ephemeral: true,
                });
            });
        if (
            !(user?.applicationStatus === 2) ||
            !(user?.division === division)
        ) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Warn')
                        .setDescription(
                            `You are not a member of division ${division}.`
                        )
                        .setColor('Yellow'),
                ],
                ephemeral: true,
            });
        }

        const c_queues = client.runtimeVariables.db.collection('queues');

        let queueData = await c_queues.findOne({
            division: division,
        });

        if (!queueData.users?.find((u) => u.id === interaction.user.id)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Warn')
                        .setDescription('You are already checked out.')
                        .setColor('Yellow'),
                ],
                ephemeral: true,
            });
        }

        c_queues
            .updateOne(
                { division: division },
                {
                    $pull: {
                        users: {
                            id: interaction.user.id,
                        },
                    },
                }
            )
            .then((result) => {
                log(result, 'debug');

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success')
                            .setDescription(`You have been checked out.`)
                            .setColor('Green'),
                    ],
                    ephemeral: true,
                });
            })
            .catch((error) => {
                log(error, 'err');
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                'An error occurred while checking you out.'
                            )
                            .setColor('Red'),
                    ],
                    ephemeral: true,
                });
            });
    },
};
