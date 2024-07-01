//Get all database data for a user
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('lookup-user')
        .setDescription('Get all database data for a user.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user to lookup.')
                .setRequired(true)
        ),
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        const c_users = client.runtimeVariables.db.collection('users');
        const user = await c_users.findOne({
            discordId: interaction.options.getUser('user').id,
        });

        if (!user) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('User Not Found')
                        .setDescription('User not found in the database.')
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('User Data')
                    .setDescription(JSON.stringify(user, null, 2))
                    .setColor('Green'),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
