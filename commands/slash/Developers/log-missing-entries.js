//Loop through all users. If they have a division or pending role but are not in the database add it to the message.
//log everything in one discord message
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { log } = require('../../../functions');
const { structure } = require('./view-applications');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('log-missing-entries')
        .setDescription(
            'Log missing entries in the database for users with roles.'
        ),
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        const c_users = client.runtimeVariables.db.collection('users');
        const roles = client.config.roles;
        const divisionRoleA = roles.divisions['A'];
        const divisionRoleB = roles.divisions['B'];
        const pendingRole = roles['fpl-pending'];
        const users = await interaction.guild.members.fetch();

        let usersFound = 0;
        let usersNotFound = 0;

        let message = '';

        for (const [_, member] of users) {
            await setTimeout(async () => {
                const user = await c_users.findOne({
                    discordId: member.id,
                });

                if (!user) {
                    usersNotFound++;
                    if (
                        member.roles.cache.has(divisionRoleA) ||
                        member.roles.cache.has(divisionRoleB)
                    ) {
                        log(
                            `User ${member.displayName} is missing from the database but has the division role.`,
                            'warn'
                        );
                        message += `User ${member.displayName} is missing from the database but has the division role. \n`;
                    } else if (member.roles.cache.has(pendingRole)) {
                        log(
                            `User ${member.displayName} is missing from the database but has the pending role.`,
                            'warn'
                        );
                        message += `User ${member.displayName} is missing from the database but has the pending role. \n`;
                    }
                }
            }, 50);
        }

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Missing Entries')
                    .setDescription(
                        `There are ${usersNotFound} missing entries in the database. \n\n${message}`
                    )
                    .setColor('Red'),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
