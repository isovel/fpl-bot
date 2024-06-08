const {
    ModalSubmitInteraction,
    ActionRowBuilder,
    ButtonBuilder,
} = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');
const components = require('../../handlers/components');

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
*/

module.exports = {
    customId: 'send-application-2',
    /**
     *
     * @param {ExtendedClient} client
     * @param {ModalSubmitInteraction} interaction
     */
    run: async (client, interaction) => {
        log('Application form Nr. 2 submitted!', 'info');
        const wins = interaction.fields.getTextInputValue('wins');
        const losses = interaction.fields.getTextInputValue('losses');
        const eliminations =
            interaction.fields.getTextInputValue('eliminations');
        const deaths = interaction.fields.getTextInputValue('deaths');
        const playtime = interaction.fields.getTextInputValue('playtime');
        let isMember = false;

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

        //validate playtime (whole number)
        if (!playtime.match(/^[0-9]+$/)) {
            await interaction.reply({
                content: 'Please enter a valid playtime!',
                ephemeral: true,
            });
            return;
        }

        //check if user has the "YouTube Member" role
        if (
            interaction.member.roles.cache.some((role) =>
                role.name.toLowerCase().includes('youtube member')
            )
        ) {
            isMember = true;
        }

        const prevData = interaction.customId.split('_');

        const userData = {
            createdAt: new Date(),
            discordId: interaction.user.id,
            embarkId: prevData[1],
            platform: prevData[4],
            lastRecordedRank: prevData[2],
            highestRecordedRank: prevData[3],
            seasonsPlayed: prevData[5],
            playtime: parseInt(playtime),
            wins: parseInt(wins),
            losses: parseInt(losses),
            eliminations: parseInt(eliminations),
            deaths: parseInt(deaths),
            kd: (eliminations / deaths).toFixed(2),
            matchesPlayed: parseInt(wins) + parseInt(losses),
            winrate: (
                (wins / (parseInt(wins) + parseInt(losses))) *
                100
            ).toFixed(2),
            isMember: isMember,
            weight: isMember ? 2 : 1,
            applicationStatus: 1, // 0 = rejected, 1 = pending, 2 = accepted
        };

        log(
            `userData for ${interaction.user.displayName}: ${JSON.stringify(
                userData
            )}`,
            'debug'
        );

        //upload with mongodb (client.runtimeVariables.db)
        try {
            const c_users = client.runtimeVariables.db.collection('users');
            const result = await c_users.insertOne(userData);
        } catch (e) {
            if (e.code === 11000) {
                await interaction.update({
                    content: 'You have already submitted an application!',
                    ephemeral: true,
                    components: [],
                });
                return;
            }

            console.dir(e);

            log(e, 'err');
            await interaction.update({
                content:
                    'An error occurred while submitting your application! (MYST has been contacted)',
                ephemeral: true,
                components: [],
            });
            return;
        }

        await interaction.update({
            content: 'Application submitted successfully!',
            ephemeral: true,
            components: [],
        });
    },
};
