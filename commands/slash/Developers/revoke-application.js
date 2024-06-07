const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ButtonBuilder,
    ActionRowBuilder,
    Routes,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('revoke-application')
        .setDescription(
            'Set the status of an application of a user to pending and remove their division'
        )
        .addUserOption((opt) =>
            opt.setName('user').setDescription('The user.').setRequired(true)
        ),
    /**
    options: {
        developers: true,
    },
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction<true>} interaction
     */
    run: async (client, interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;

        client.runtimeVariables.db
            .collection('users')
            .updateOne(
                {
                    discordId: user.id,
                },
                {
                    $set: {
                        applicationStatus: 1,
                        division: null,
                    },
                }
            )
            .then((result) => {
                log(result, 'debug');

                if (result.matchedCount == 0) {
                    return interaction.reply({
                        content: `${user.displayName} does not have an application.`,
                        ephemeral: true,
                    });
                }
                if (result.modifiedCount == 0) {
                    return interaction.reply({
                        content: `${user.displayName}'s application is already in pending status`,
                        ephemeral: true,
                    });
                }

                interaction.reply({
                    content: 'The application has been revoked.',
                    ephemeral: true,
                });
            });
    },
};
