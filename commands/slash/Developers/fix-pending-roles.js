const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('fix-pending-roles')
        .setDescription('Fixes the pending roles for users.'),
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        //for all discord members with the pending role, check if they have the division role
        const roles = client.config.roles;
        const divisionRoleA = roles.divisions['A'];
        const divisionRoleB = roles.divisions['B'];
        const pendingRole = roles['fpl-pending'];

        const guild = await client.guilds.fetch(interaction.guildId);
        const members = await guild.members.fetch();

        let message = '';
        let usersFixed = 0;

        for (const [_, member] of members) {
            if (member.roles.cache.has(pendingRole)) {
                log(`Checking user ${member.displayName}`, 'info');
                if (
                    member.roles.cache.has(divisionRoleA) ||
                    member.roles.cache.has(divisionRoleB)
                ) {
                    log(
                        `User ${member.displayName} has the pending role but also has the division role. Removing pending role.`,
                        'warn'
                    );
                    await member.roles.remove(pendingRole);
                    message += `User ${member.displayName} has the pending role but also has the division role. Removed pending role. \n`;
                    usersFixed++;
                }
            }
        }

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Fixed Pending Roles')
                    .setDescription(
                        `Fixed the pending roles for ${usersFixed} users. \n\n${message}`
                    )
                    .setColor('Green'),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
