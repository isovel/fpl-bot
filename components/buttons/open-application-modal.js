const {
    ButtonInteraction,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

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

                 new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setLabel('Embark ID')
                    .setCustomId('embark-id')
                    .setPlaceholder(
                        'You can check this at https://id.embark.games/id/profile'
                    )
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setLabel('Last Recorded Rank')
                    .setCustomId('last-recorded-rank')
                    .setPlaceholder(
                        'Unranked, Bronze, Silver, Gold, Platinum, Diamond'
                    )
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setLabel('Platform')
                    .setCustomId('platform')
                    .setPlaceholder('PC, Playstation, Xbox')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setLabel('Seasons Played')
                    .setCustomId('seasons-played')
                    .setPlaceholder('CB1, CB2, OB1, S1, S2 (Seperate by comma)')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setLabel('Playtime')
                    .setCustomId('playtime')
                    .setPlaceholder('In Hours')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
            ),
*/

module.exports = {
    customId: 'open-application-modal',
    /**
     *
     * @param {ExtendedClient} client
     * @param {ButtonInteraction} interaction
     */
    run: async (client, interaction) => {
        const modal = new ModalBuilder()
            .setTitle('Application Form')
            .setCustomId('send-application')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setLabel('Embark ID')
                        .setCustomId('embark-id')
                        .setPlaceholder('unkown#1234')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setLabel('Main Platform')
                        .setCustomId('platform')
                        .setPlaceholder('PC, Playstation or Xbox (Only one)')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setLabel('Seasons Played')
                        .setCustomId('seasons-played')
                        .setPlaceholder(
                            'CB1, CB2, OB1, S1, S2 (Seperate by comma)'
                        )
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setLabel('Last Recorded Rank')
                        .setCustomId('last-recorded-rank')
                        .setPlaceholder(
                            'Unranked, Bronze, Silver, Gold, Platinum, Diamond'
                        )
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setLabel('Highest Recorded Rank')
                        .setCustomId('highest-recorded-rank')
                        .setPlaceholder(
                            'Your Highest Recorded Rank and Season (Gold-CB1)'
                        )
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                )
            );

        await interaction.showModal(modal);
    },
};
