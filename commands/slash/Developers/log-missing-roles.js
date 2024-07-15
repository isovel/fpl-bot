//Loop through all db users. If their discordId doesnt have a division or pending role add tagged user to the message.
//log everything in one discord message
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('log-missing-roles')
        .setDescription(
            'Log missing roles in the database for users with entries.'
        ),
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        await interaction.deferReply();
        const c_users = client.runtimeVariables.db.collection('users');
        const roles = client.config.roles;
        const divisionRoleA = roles.divisions['A'];
        const divisionRoleB = roles.divisions['B'];
        const pendingRole = roles.pending;
        const users = await c_users.find().toArray();
        const guild = await interaction.guild;
        const members = await guild.members.fetch();

        let usersFound = 0;
        let usersNotFound = 0;
        let processedUsers = 0;

        let message = '';

        for (const user of users) {
            setTimeout(async () => {
                processedUsers++;
                const member = members.get(user.discordId);

                if (!member) return;

                usersFound++;
                if (
                    !member.roles.cache.has(divisionRoleA) &&
                    !member.roles.cache.has(divisionRoleB) &&
                    !member.roles.cache.has(pendingRole)
                ) {
                    log(
                        `User ${member.displayName} has an entry in the database but is missing a role.`,
                        'warn'
                    );
                    message += `<@${member.id}> - ${
                        user.division || user.applicationStatus == 1
                            ? 'pending'
                            : user.applicationStatus == 0
                            ? 'declined'
                            : 'unkown'
                    }\n`;
                    usersNotFound++;
                }
                if (processedUsers >= users.length) {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Missing Roles')
                                .setDescription(
                                    `Users found: ${usersFound}. \nUsers missing roles: ${usersNotFound}. \n\n${message}`
                                )
                                .setColor('Green'),
                        ],
                        ephemeral: client.config.development.ephemeral,
                    });
                }
            }, 50);
        }
    },
};
