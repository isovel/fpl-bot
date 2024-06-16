const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

module.exports = {
    customId: 'end-match',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {*} interaction
     */
    run: async (client, interaction) => {
        const division = interaction.customId.split('_')[1];

        const c_matches = client.runtimeVariables.db.collection('matches');

        const match = await c_matches.findOne({
            division: division,
            msgId: interaction.message.id,
        });

        if (!match) {
            return interaction.reply({
                content: 'Match code not set.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (match.status != 1) {
            return interaction.reply({
                content: 'Match has not been started yet.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        //send a message to the interaction channel to enter the match result for the first player. It should first have a message to ask how many teams played in the match, then ask for the result of each member of each team. The member result message should have a selection menu to select which team they were on. When the team they were on is selected a modal opens up to enter the data.
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Teams Played')
                    .setDescription(
                        'Please enter the number of teams that played in the match.'
                    )
                    .setColor('Purple'),
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('match-teams-amount')
                        .setPlaceholder('Select the number of teams')
                        .addOptions([
                            {
                                label: '2',
                                value: '2',
                            },
                            {
                                label: '3',
                                value: '3',
                            },
                            {
                                label: '4',
                                value: '4',
                            },
                        ])
                ),
            ],
        });
    },
};
