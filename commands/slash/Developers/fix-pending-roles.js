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
        const pendingRole = pending;

        const guild = await client.guilds.fetch(interaction.guildId);
        const members = await guild.members.fetch();

        let message = '';
        let usersFixed = 0;
        let usersNotFixed = 0;
        let divRoleCount = 0;

        log(`Members: ${members.size}`, 'info');

        for (const [_, member] of members) {
            if (
                member.roles.cache.has(divisionRoleA) ||
                member.roles.cache.has(divisionRoleB)
            ) {
                log(`Checking user ${member.displayName}`, 'info');
                divRoleCount++;
                if (member.roles.cache.has(pendingRole)) {
                    log(
                        `User ${member.displayName} has the pending role but also has the division role. Removing pending role.`,
                        'warn'
                    );
                    await member.roles.remove(pendingRole);
                    message += `User ${member.displayName} has the pending role but also has the division role. Removed pending role. \n`;
                    usersFixed++;
                } else {
                    usersNotFixed++;
                }
            } else {
                usersNotFixed++;
            }
        }

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Fixed Pending Roles')
                    .setDescription(
                        `Div Roles: ${divRoleCount}. \nFixed the pending roles for ${usersFixed} users. \nNo fix for ${usersNotFixed} users. \n\n${message}`
                    )
                    .setColor('Green'),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
