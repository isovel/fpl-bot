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
        .setName('send-timezone-message')
        .setDescription('Send a message with the timezone buttons.')
        .addStringOption((option) =>
            option
                .setName('text')
                .setDescription('The text to display in the message.')
                .setRequired(false)
        ),
    options: {
        developers: true,
    },
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction<true>} interaction
     */
    run: async (client, interaction) => {
        const text =
            interaction.options.getString('text') ||
            'Click on all the Timezones you wish to be invited to play in.';

        await interaction.reply({
            content: text,
            components: [
                new ActionRowBuilder().addComponents(
                    client.config.times.timezones.map((timezone) =>
                        new ButtonBuilder()
                            .setCustomId(`accept-timezone_${timezone.name}`)
                            .setLabel(timezone.description)
                            .setStyle('Primary')
                    )
                ),
            ],
        });
    },
};
