const { StringSelectMenuInteraction } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const viewApplications = require('../../commands/slash/Developers/view-applications');

module.exports = {
    customId: 'application-action',
    /**
     *
     * @param {ExtendedClient} client
     * @param {StringSelectMenuInteraction} interaction
     */
    run: async (client, interaction) => {
        const value = interaction.values[0];
        const discordId = interaction?.customId?.split('_')[1];
        const skipIds = interaction?.customId?.split('_')[2].split(',');

        switch (value) {
            case 'skip':
                //skip for later review
                viewApplications.run(client, interaction, [
                    ...skipIds,
                    discordId,
                ]);
                break;
            case 'decline':
                //decline the application
                client.runtimeVariables.db.collection('users').updateOne(
                    {
                        discordId,
                    },
                    {
                        $set: {
                            applicationStatus: 0,
                        },
                    }
                );
                viewApplications.run(client, interaction, [
                    ...skipIds,
                    discordId,
                ]);

                break;
            default:
                if (parseInt(value) > 0) {
                    client.runtimeVariables.db.collection('users').updateOne(
                        {
                            discordId,
                        },
                        {
                            $set: {
                                applicationStatus: 2,
                                division: parseInt(value),
                            },
                        }
                    );
                    viewApplications.run(client, interaction, [
                        ...skipIds,
                        discordId,
                    ]);
                }
                break;
        }
    },
};
