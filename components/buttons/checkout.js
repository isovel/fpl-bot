const {} = require('discord.js');
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
                    content: 'An error occurred while checking you out.',
                    ephemeral: true,
                });
            });
        if (
            !(user?.applicationStatus === 2) ||
            !(user?.division === division)
        ) {
            return interaction.reply({
                content: `You are not a member of division ${division}.`,
                ephemeral: true,
            });
        }
        let weight = user.weight || 1;

        const c_queues = client.runtimeVariables.db.collection('queues');

        let queueData = await c_queues.findOne({
            division: division,
        });

        if (!queueData.users?.find((u) => u.id === interaction.user.id)) {
            return interaction.reply({
                content: 'You are already checked out.',
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
                            name: user.embarkId.slice(0, -5),
                            weight,
                        },
                    },
                }
            )
            .then((result) => {
                log(result, 'debug');

                return interaction.reply({
                    content: 'You have been checked out.',
                    ephemeral: true,
                });
            })
            .catch((error) => {
                log(error, 'err');
                return interaction.reply({
                    content: 'An error occurred while checking you out.',
                    ephemeral: true,
                });
            });
    },
};
