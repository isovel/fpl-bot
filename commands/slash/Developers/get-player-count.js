//get all players. Then in one mssage log: amount of all players, all assigned players, all unassigned players, all division A Players, all division B Players
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('get-player-count')
        .setDescription('Get user counts'),
    options: {
        developers: true,
    },
    async run(client, interaction) {
        const c_users = client.runtimeVariables.db.collection('users');
        let users;
        try {
            users = await c_users.find({}).toArray();
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
        let allPlayers = 0;
        let assignedPlayers = 0;
        let pendingPlayers = 0;
        let deniedPlayers = 0;
        let divisionAPlayers = 0;
        let divisionBPlayers = 0;
        for (const user of users) {
            allPlayers++;
            if (user.applicationStatus == 2) assignedPlayers++;
            else if (user.applicationStatus == 0) deniedPlayers++;
            else pendingPlayers++;
            if (user.division === 'A') divisionAPlayers++;
            else if (user.division === 'B') divisionBPlayers++;
        }
        interaction.reply({
            components: [],
            embeds: [
                new EmbedBuilder()
                    .setTitle('Player Counts')
                    .setDescription(
                        `All players: ${allPlayers}\nAssigned players: ${assignedPlayers}\nPending players: ${pendingPlayers}\nDenied players: ${deniedPlayers}\nDivision A players: ${divisionAPlayers}\nDivision B players: ${divisionBPlayers}`
                    )
                    .setColor('Green'),
            ],
        });
    },
};
