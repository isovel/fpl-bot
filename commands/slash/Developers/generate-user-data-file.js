//get all users from db
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('generate-user-data-file')
        .setDescription('Get all user data.'),
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        const c_users = client.runtimeVariables.db.collection('users');
        let users;
        try {
            users = await c_users.find({}).toArray();
            console.dir(users);
        } catch (error) {
            log(error, 'err');
            return interaction.reply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            'An error occurred while fetching the applications.'
                        )
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }
        if (users.length === 0) {
            return interaction.reply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle('No Users')
                        .setDescription('There are no users in the database.')
                        .setColor('Purple'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }
        interaction.reply({
            components: [],
            embeds: [
                new EmbedBuilder()
                    .setTitle('Users')
                    .setDescription(
                        `There are ${users.length} users in the database.`
                    )
                    .setColor('Green'),
            ],
            files: [
                {
                    attachment: Buffer.from(JSON.stringify(users, null, 2)),
                    name: 'users.json',
                },
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
