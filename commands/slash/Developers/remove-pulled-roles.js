//Remove chosen role from all users
const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const { log } = require('../../../functions');
const config = process.env.PRODUCTION
    ? require('../../../server-config')
    : require('../../../config');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('remove-pulled-roles')
        .setDescription('Remove chosen role from all users.')
        .addStringOption((opt) =>
            opt
                .setName('division')
                .setDescription('The division to fix the pulled users for.')
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
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        //for all discord users
        const members = await interaction.guild.members.fetch();
        const role = client.config.roles.pulled;
        const division = interaction.options.getString('division');

        const c_queues = client.runtimeVariables.db.collection('queues');

        let queueData = await c_queues.findOne({
            division: division,
        });

        if (!queueData) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('Queue not found in the database.')
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (!queueData.randomUsers?.length) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('No users have been pulled yet.')
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

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

        await queueData.randomUsers.forEach(async (u) => {
            const user = await interaction.guild.members.fetch(u.id);
            user.roles.add(role);
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
