const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Get your stats (or the stats of a user).')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user to get the stats of.')
                .setRequired(false)
        ),
    run: async (client, interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;

        //check if user has an application
        const c_users = client.runtimeVariables.db.collection('users');
        const userDoc = await c_users.findOne({
            discordId: user.id,
        });

        if (!userDoc) {
            return await interaction.reply({
                content: 'This user does not have an application.',
            });
        }

        if (!userDoc.resultData) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Stats')
                        .setDescription(`Stats for ${user.username}`)
                        .addField(
                            'No stats',
                            'This user does not have any stats.'
                        ),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('Stats')
            .setDescription(`Stats for ${user.username}`);

        await interaction.reply({
            embeds: [embed],
        });
    },
};
