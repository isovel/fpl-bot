//Remove chosen role from all users
const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('remove-chosen-roles')
        .setDescription('Remove chosen role from all users.'),
    options: {
        developers: true,
    },
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        //for all discord users
        const members = await interaction.guild.members.fetch();
        const role = client.config.roles.pulled;

        log(`Removing pulled role from ${members.size} users.`, 'info');

        if (!role) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('Role not found.')
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }
        log(`Removing pulled role from all users.`, 'info');
        await members.forEach((member) => {
            member.roles.remove(role);
        });

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Role Removed')
                    .setDescription('Role removed from all users.')
                    .setColor('Green'),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
