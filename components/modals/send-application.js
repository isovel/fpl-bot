const {
    ModalSubmitInteraction,
    ActionRowBuilder,
    ButtonBuilder,
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
                        .setLabel('Playtime')
                        .setCustomId('playtime')
                        .setPlaceholder('In Hours')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setLabel('Wins')
                        .setCustomId('wins')
                        .setPlaceholder('Number of Wins')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setLabel('Losses')
                        .setCustomId('losses')
                        .setPlaceholder('Number of Losses')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setLabel('Eliminations')
                        .setCustomId('eliminations')
                        .setPlaceholder('Number of Eliminations')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setLabel('Deaths')
                        .setCustomId('deaths')
                        .setPlaceholder('Number of Deaths')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setLabel('Matches Played')
                        .setCustomId('matches-played')
                        .setPlaceholder('Number of Matches Played')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ),
                
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setLabel('Main Class')
                        .setCustomId('main-class')
                        .setPlaceholder('Light, Medium, Heavy')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ),
*/

module.exports = {
    customId: 'send-application',
    /**
     *
     * @param {ExtendedClient} client
     * @param {ModalSubmitInteraction} interaction
     */
    run: async (client, interaction) => {
        log('Application form submitted!', 'info');
        const embarkId = interaction.fields.getTextInputValue('embark-id');
        const lastRecordedRank =
            interaction.fields.getTextInputValue('last-recorded-rank');
        const highestRecordedRank = interaction.fields.getTextInputValue(
            'highest-recorded-rank'
        );
        const platform = interaction.fields.getTextInputValue('platform');
        const seasonsPlayed =
            interaction.fields.getTextInputValue('seasons-played');
        let isMember = false;

        //validate embark id with regex (asd#1234)
        if (!embarkId.match(/^[a-zA-Z0-9]+#[0-9]{4}$/)) {
            await interaction.reply({
                content: 'Please enter a valid Embark ID!',
                ephemeral: true,
            });
            return;
        }

        //validate last recorded rank
        if (
            ![
                'unranked',
                'bronze',
                'silver',
                'gold',
                'platinum',
                'diamond',
            ].includes(lastRecordedRank.toLowerCase())
        ) {
            await interaction.reply({
                content:
                    'Please enter a valid rank for your last recorded rank!',
                ephemeral: true,
            });
            return;
        }

        //validate highest recorded rank with regex(Gold-CB1)
        if (
            !highestRecordedRank
                .toLowerCase()
                .match(
                    /^(unranked|bronze|silver|gold|platinum|diamond)-(cb1|cb2|ob1|s1|s2)$/
                )
        ) {
            await interaction.reply({
                content:
                    'Please enter a valid rank and season for your highest recorded rank!',
                ephemeral: true,
            });
            return;
        }

        //validate Platform
        if (!['pc', 'playstation', 'xbox'].includes(platform.toLowerCase())) {
            await interaction.reply({
                content: 'Please enter a valid platform!',
                ephemeral: true,
            });
            return;
        }

        //validate seasons played ()
        let seasons = seasonsPlayed.split(',');
        let validSeasons = ['cb1', 'cb2', 'ob1', 's1', 's2'];
        seasons = seasons.map((season) => season.trim().toLowerCase());
        log(seasons, 'debug');
        for (let season of seasons) {
            if (!validSeasons.includes(season)) {
                console.log(season);
                await interaction.reply({
                    content: 'Please only enter valid seasons!',
                    ephemeral: true,
                });
                return;
            }
        }

        //show application form 2
        await interaction.reply({
            content: 'Please press the button to continue:',
            ephemeral: true,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `open-application-modal-2_${embarkId}_${lastRecordedRank}_${highestRecordedRank}_${platform}_${seasons.join(
                                ','
                            )}`
                        )
                        .setLabel('Continue')
                        .setStyle('Primary')
                ),
            ],
        });

        /*
        //validate wins, losses, eliminations, deaths, matches played
        if (!wins.match(/^[0-9]+$/)) {
            await interaction.reply({
                content: 'Please enter a valid number of wins!',
                ephemeral: true,
            });
            return;
        }

        if (!losses.match(/^[0-9]+$/)) {
            await interaction.reply({
                content: 'Please enter a valid number of losses!',
                ephemeral: true,
            });
            return;
        }

        if (!eliminations.match(/^[0-9]+$/)) {
            await interaction.reply({
                content: 'Please enter a valid number of eliminations!',
                ephemeral: true,
            });
            return;
        }

        if (!deaths.match(/^[0-9]+$/)) {
            await interaction.reply({
                content: 'Please enter a valid number of deaths!',
                ephemeral: true,
            });
            return;
        }

        if (!matchesPlayed.match(/^[0-9]+$/)) {
            await interaction.reply({
                content: 'Please enter a valid number of matches played!',
                ephemeral: true,
            });
            return;
        }
        */

        /*

        //check if user has the "YouTube Member" role
        if (
            interaction.member.roles.cache.some((role) =>
                role.name.toLowerCase().includes('youtube member')
            )
        ) {
            isMember = true;
        }
        */
    },
};
