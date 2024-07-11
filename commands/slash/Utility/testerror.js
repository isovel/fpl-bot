const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('testerror')
        .setDescription('Test what happens if an error occurs!'),
    options: {
        developers: true,
    },
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        log('This is a test error!', 'err');

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success')
                    .setDescription('Test error has been generated!')
                    .setColor('Green'),
            ],
            ephemeral: true,
        });
    },
};
