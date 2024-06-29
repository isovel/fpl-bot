const { SlashCommandBuilder } = require('discord.js');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('fix-pending-roles')
        .setDescription('Fixes the pending roles for users.'),
    options: {
        developers: true,
    },
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const c_users = client.runtimeVariables.db.collection('users');
        let users;
        try {
            users = await c_users
                .find({
                    applicationStatus: 1,
                })
                .toArray();

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
                        .setTitle('No Applications')
                        .setDescription('There are no pending applications.')
                        .setColor('Purple'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        users.forEach((user) => {
            interaction.guild.members.fetch(user.discordId).then((member) => {
                //if the member has one of the division roles, remove the pending role
                if (
                    client.config.divisions.some((d) =>
                        member.roles.cache.has(client.config.roles[d.shortName])
                    )
                ) {
                    member.roles.remove(client.config.roles['fpl-pending']);
                }
            });
        });

        interaction.reply({
            components: [],
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success')
                    .setDescription('All pending applications have been fixed.')
                    .setColor('Green'),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
