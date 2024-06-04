const {} = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');

module.exports = {
    customId: 'accept-timezone',
    options: {
        public: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {*} interaction
     */
    run: async (client, interaction) => {
        const timezone = interaction.customId.split('_')[1];

        //Check if the user has already accepted the timezone (db)
        //If not, add the timezone to the user's timezone list (db)
        let result = await client.runtimeVariables.db
            .collection('users')
            .updateOne(
                { discordId: interaction.user.id },
                {
                    $addToSet: {
                        timezones: timezone,
                    },
                },
                { upsert: true }
            );

        if (result.modifiedCount == 0) {
            await interaction.reply({
                content: `You have already accepted the timezone ${timezone}.`,
                ephemeral: true,
            });

            return;
        }

        await interaction.reply({
            content: `You have accepted the timezone ${timezone}.`,
            ephemeral: true,
        });
    },
};
