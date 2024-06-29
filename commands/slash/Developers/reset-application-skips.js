const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('reset-application-skips')
        .setDescription('Reset the application skips.'),
    options: {
        developers: true,
    },
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        client.runtimeVariables.applicationSkips = [];
        log('Application skips have been reset.', 'info');
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Application Skips Reset')
                    .setDescription('The application skips have been reset.')
                    .setColor('Green'),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
