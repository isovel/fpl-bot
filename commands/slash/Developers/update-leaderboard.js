const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { updateLeaderboard } = require('../../../handlers/leaderboard');
const config = process.env.PRODUCTION
    ? require('../../../server-config')
    : require('../../../config');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('update-leaderboard')
        .setDescription('Update the leaderboard of a division.')
        .addStringOption((option) =>
            option
                .setName('division')
                .setDescription('The division to update the leaderboard of.')
                .setRequired(true)
                .addChoices(
                    config.divisions.map((d) => {
                        return { name: d.shortName, value: d.shortName };
                    })
                )
        ),
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        const division = interaction.options.getString('division');

        await updateLeaderboard(client, division);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Leaderboard Updated')
                    .setDescription('Leaderboard updated.')
                    .setColor('Green'),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
