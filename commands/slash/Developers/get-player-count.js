//get all players. Then in one mssage log: amount of all players, all assigned players, all unassigned players, all division A Players, all division B Players
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { log } = require('../../../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-player-count')
        .setDescription('Get user counts'),
    async execute(interaction) {
        const allPlayers = await interaction.client.db.players.getAll();
        const assignedPlayers = allPlayers.filter((player) => player.assigned);
        const unassignedPlayers = allPlayers.filter(
            (player) => !player.assigned
        );
        const divisionAPlayers = allPlayers.filter(
            (player) => player.division === 'A'
        );
        const divisionBPlayers = allPlayers.filter(
            (player) => player.division === 'B'
        );

        const embed = new EmbedBuilder()
            .setTitle('Player Count')
            .addField('All Players', allPlayers.length, true)
            .addField('Assigned Players', assignedPlayers.length, true)
            .addField('Unassigned Players', unassignedPlayers.length, true)
            .addField('Division A Players', divisionAPlayers.length, true)
            .addField('Division B Players', divisionBPlayers.length, true)
            .setColor('Purple')
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
        log('Player count retrieved', embed);
    },
};
