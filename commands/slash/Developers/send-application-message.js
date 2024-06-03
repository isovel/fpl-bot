const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ButtonBuilder,
    ActionRowBuilder,
    Routes,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const { log } = require('../../../functions');

/*
What is your Embark ID? (You can check this at https://id.embark.games/id/profile)

What was your last recorded rank? (Unranked, Bronze, Silver, Gold, Platinum, Diamond)

How much playtime do you have? (In-Game statistics not steam! In Hours)

Platform (PC, Playstation, Xbox)

Wins
Losses
Eliminations
Deaths
Matches Played

Sesons Played (CB1, CB2, OB1, S1, S2) (Seperate by comma)

What is your main Class? (Light, Medium, Heavy)
*/

//add an option for text and button text

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('send-application-message')
        .setDescription(
            'Send a message and the button to open the application form.'
        )
        .addStringOption((option) =>
            option
                .setName('text')
                .setDescription('The text to display in the message.')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('button-text')
                .setDescription('The text to display in the button.')
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
            'Click the Button to open the Application form!';
        const buttonText =
            interaction.options.getString('button-text') || 'Open Application';

        await interaction.reply({
            content: text,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('open-application-modal')
                        .setLabel(buttonText)
                        .setStyle('Primary')
                ),
            ],
        });
    },
};
