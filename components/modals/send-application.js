const {
    ModalSubmitInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
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
        const embarkId = interaction.fields
            .getTextInputValue('embark-id')
            .replaceAll('_', '~')
            .replaceAll(' ', '');
        let lastRecordedRank =
            interaction.fields.getTextInputValue('last-recorded-rank');
        let highestRecordedRank = interaction.fields.getTextInputValue(
            'highest-recorded-rank'
        );
        const platform = interaction.fields.getTextInputValue('platform');
        const seasonsPlayed =
            interaction.fields.getTextInputValue('seasons-played');
        let isMember = false;
        const seasonAbrs = {
            'alpha': 'alpha',
            'closed beta 1': 'cb1',
            'closed beta 2': 'cb2',
            'open beta 1': 'ob1',
            'open beta': 'ob1',
            'season 1': 's1',
            'season 2': 's2',
            'season 3': 's3',
        };

        //validate embark id with regex (asd#1234)
        if (!embarkId.match(/.{2,}#[0-9]{4}$/)) {
            log(
                `${interaction.user.displayName} entered an invalid Embark ID! ${embarkId}`,
                'warn'
            );
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            `Please enter a valid Embark ID! \nYou entered: ${embarkId} \nAn example would be: unknown#1234`
                        )
                        .setColor('Red'),
                ],
                ephemeral: true,
            });
            return;
        }

        //validate Platform
        if (!['pc', 'playstation', 'xbox'].includes(platform.toLowerCase())) {
            log(
                `${interaction.user.displayName} entered an invalid platform! ${platform}`,
                'warn'
            );
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            `Please enter a valid platform! \nYou entered: ${platform} \nAn example would be: Playstation \nRemember to only enter the platform and not the console.`
                        )
                        .setColor('Red'),
                ],
                ephemeral: true,
            });
            return;
        }

        //validate seasons played ()
        let seasons = seasonsPlayed.split(',');
        let validSeasons = [
            'alpha',
            'cb1',
            'cb2',
            'ob',
            'ob1',
            's1',
            's2',
            's3',
        ];
        seasons = seasons.map((season) => {
            //replace all seasonabrs with full names
            season = season.toLowerCase().trim();
            if (seasonAbrs[season]) {
                return seasonAbrs[season];
            }
            return season.trim().toLowerCase();
        });
        for (let season of seasons) {
            if (!validSeasons.includes(season)) {
                log(
                    `${interaction.user.displayName} entered an invalid season! ${season}`,
                    'warn'
                );
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                `Please only enter valid seasons for seasons you played! \nYou entered: ${seasons.join(
                                    ', '
                                )} \nAn example would be: CB2, OB1, S2 \nRemember to seperate each season with a comma.`
                            )
                            .setColor('Red'),
                    ],
                    ephemeral: true,
                });
                return;
            }
        }

        //validate last recorded rank
        lastRecordedRank = lastRecordedRank.toLowerCase().trim();
        if (lastRecordedRank.split(' ')[0] == 'plat') {
            lastRecordedRank = lastRecordedRank.replace('plat', 'platinum');
        }
        //if last char is not a number add 4
        if (!lastRecordedRank[lastRecordedRank.length - 1].match(/[1-4]/)) {
            lastRecordedRank += ' 4';
        }
        if (lastRecordedRank.startsWith('unranked')) {
            lastRecordedRank = 'unranked';
        }
        if (lastRecordedRank.split(' ').length > 2) {
            lastRecordedRank = lastRecordedRank
                .split(' ')
                .slice(0, 2)
                .join(' ');
        }
        if (
            !lastRecordedRank.match(
                /^(unranked|bronze|silver|gold|platinum|diamond) (1|2|3|4)$/
            ) &&
            lastRecordedRank != 'unranked'
        ) {
            log(
                `${interaction.user.displayName} entered an invalid last recorded rank! ${lastRecordedRank}`,
                'warn'
            );
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            `Please enter a valid rank for your last recorded rank! \nYou entered: ${lastRecordedRank} \nAn example would be: Gold 1 \nRemember to not use any abbreviations, add the number at the end and use a space.`
                        )
                        .setColor('Red'),
                ],
                ephemeral: true,
            });
            return;
        }

        //validate highest recorded rank with regex(Gold-CB1)

        //Replace all season abbrs with full names
        highestRecordedRank = highestRecordedRank.toLowerCase().trim();
        Object.keys(seasonAbrs).forEach((season) => {
            highestRecordedRank = highestRecordedRank.replace(
                season,
                seasonAbrs[season]
            );
        });
        highestRecordedRank = highestRecordedRank.replace(',', '');
        highestRecordedRank = highestRecordedRank.replace('  ', ' ');
        if (highestRecordedRank.split(' ')[0] == 'plat') {
            highestRecordedRank = highestRecordedRank.replace(
                'plat',
                'platinum'
            );
        }
        if (
            !highestRecordedRank.match(
                /^(unranked|bronze|silver|gold|platinum|diamond) (1|2|3|4) (cb1|cb2|ob1|s1|s2|s3)$/
            ) &&
            highestRecordedRank != 'unranked'
        ) {
            log(
                `${interaction.user.displayName} entered an invalid highest recorded rank! ${highestRecordedRank}`,
                'warn'
            );
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            `Please enter a valid rank and season for your highest recorded rank! \nYou entered: ${highestRecordedRank} \nAn example would be: Gold 1 CB1 \nRemember to add the season in which you achieved this rank.`
                        )
                        .setColor('Red'),
                ],
                ephemeral: true,
            });
            return;
        }

        //show application form 2
        await interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle('Application Form 2')
                    .setDescription(
                        'Please press the "Continue" button to proceed to the next part of the application form.'
                    )
                    .setColor('Purple'),
            ],
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
