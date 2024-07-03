const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
} = require('discord.js');
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

        if (match.status == 2 || match.status == 3) {
            return interaction.reply({
                content: 'Match has already ended.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (match.status == 0) {
            return interaction.reply({
                content: 'Match has not been started yet.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        //set the match status to 2 to indicate that the match has ended
        await c_matches.updateOne(
            {
                division: division,
                msgId: interaction.message.id,
            },
            {
                $set: {
                    status: 2,
                },
            }
        );

        //send a message to the interaction channel to enter the match result for the first player. It should first have a message to ask how many teams played in the match, then ask for the result of each member of each team. The member result message should have a selection menu to select which team they were on. When the team they were on is selected a modal opens up to enter the data.
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Gamemode Selection')
                    .setDescription(
                        'Please enter the gamemode of the match. This will be used to calculate the points for the match.'
                    )
                    .setColor('Purple'),
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(
                            `match-gamemode_${division}_${interaction.message.id}`
                        )
                        .setPlaceholder('Select the Gamemode')
                        .addOptions(
                            client.config.gamemodes.map((gm) => ({
                                label: gm.label,
                                value: gm.value,
                            }))
                        )
                ),
            ],
        });
    },
};
