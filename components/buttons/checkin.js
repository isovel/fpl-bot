const {} = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

module.exports = {
    customId: 'checkin',
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
                    content: 'An error occurred while checking you in.',
                    ephemeral: true,
                });
            });
        if (!user?.applicationStatus === 2 || !user?.division === division) {
            return interaction.reply({
                content: `You are not a member of division ${division}.`,
                ephemeral: true,
            });
        }
        let weight = user.weight || 1;

        client.runtimeVariables.db
            .collection('queues')
            .updateOne(
                { division: division },
                {
                    $addToSet: {
                        users: { user: interaction.user.id, weight },
                    },
                }
            )
            .then((result) => {
                log(result, 'debug');
                if (result.modifiedCount === 0) {
                    return interaction.reply({
                        content: 'You are already checked in.',
                        ephemeral: true,
                    });
                }

                return interaction.reply({
                    content: 'You have been checked in.',
                    ephemeral: true,
                });
            })
            .catch((error) => {
                log(error, 'err');
                return interaction.reply({
                    content: 'An error occurred while checking you in.',
                    ephemeral: true,
                });
            });
    },
};
