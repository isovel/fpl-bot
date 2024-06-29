//some users have been deleted from the database on accident but still have the role. Loop through all users and check if they have the role but not in the database (use delay between each user to not overuse db). If they have the division role but not in the database, message them that there has been an issue with their application, tell them that their division will not change, apologize deeply and tell them to resubmit their application. If they have the pending role apologize, and tell them to resubmit.
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('fix-missing-entries')
        .setDescription(
            'Fix missing entries in the database for users with roles.'
        ),
    options: {
        owneOnly: true,
    },
    run: async (client, interaction) => {
        interaction.deferReply({ ephemeral: true });
        const c_users = client.runtimeVariables.db.collection('users');
        const guild = client.config.development.guild;
        const roles = client.config.roles;
        const divisionRoleA = roles.divisions['A'];
        const divisionRoleB = roles.divisions['B'];
        const pendingRole = roles['fpl-pending'];
        const users = await guild.members.fetch();

        for (const [_, member] of users) {
            setTimeout(async () => {
                const user = await c_users.findOne({
                    discordId: member.id,
                });
                if (!user) {
                    if (
                        member.roles.cache.has(divisionRoleA) ||
                        member.roles.cache.has(divisionRoleB)
                    ) {
                        client.users.send(member.id, {
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Application Issue')
                                    .setDescription(
                                        'We have noticed that you have the division role but are not in the database. Your division will not change, but we apologize for the inconvenience. Please resubmit your application.'
                                    )
                                    .setColor('Red'),
                            ],
                        });
                    } else if (member.roles.cache.has(pendingRole)) {
                        //remove pending role
                        member.roles.remove(pendingRole);
                        client.users.send(member.id, {
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Application Issue')
                                    .setDescription(
                                        'We have noticed that you have the pending role but are not in the database. We apologize for the inconvenience. Please resubmit your application.'
                                    )
                                    .setColor('Red'),
                            ],
                        });
                    }
                }
            }, 50);
        }

        log('Missing entries have been fixed.', 'info');
        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Missing Entries Fixed')
                    .setDescription('Missing entries have been fixed.')
                    .setColor('Green'),
            ],
        });
    },
};
