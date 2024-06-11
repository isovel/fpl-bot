const { StringSelectMenuInteraction } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const viewApplications = require('../../commands/slash/Developers/view-applications');
const { log } = require('../../functions');

module.exports = {
    customId: 'application-action',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {StringSelectMenuInteraction} interaction
     */
    run: async (client, interaction) => {
        const value = interaction.values[0];
        const discordId = interaction?.customId?.split('_')[1];
        const skipIds = interaction?.customId?.split('_')[2].split(',');

        switch (value) {
            case 'skip':
                //skip for later review
                viewApplications.run(client, interaction, [
                    ...skipIds,
                    discordId,
                ]);
                break;
            case 'decline':
                //decline the application
                client.runtimeVariables.db.collection('users').updateOne(
                    {
                        discordId,
                    },
                    {
                        $set: {
                            applicationStatus: 0,
                        },
                    }
                );
                client.users.send(
                    discordId,
                    'We are sorry to inform you that your application has been declined. Please contact a staff member for more information.'
                );
                viewApplications.run(client, interaction, [
                    ...skipIds,
                    discordId,
                ]);
                break;
            default:
                if (value) {
                    client.runtimeVariables.db.collection('users').updateOne(
                        {
                            discordId,
                        },
                        {
                            $set: {
                                applicationStatus: 2,
                                division: value,
                            },
                        }
                    );
                    client.users.send(
                        discordId,
                        `Congratulations! Your application has been accepted. You are now part of division ${value}.`
                    );
                    //give role
                    const member =
                        (await interaction.guild.members.cache.find(
                            (m) => m.id == discordId
                        )) ??
                        (await interaction.guild.members.fetch(discordId));
                    const roleId = client.config.roles.divisions[value];
                    const role =
                        (await interaction.guild.roles.cache.find(
                            (r) => r.id == roleId
                        )) ?? (await interaction.guild.roles.fetch(roleId));

                    member.roles.add(role);

                    viewApplications.run(client, interaction, [
                        ...skipIds,
                        discordId,
                    ]);
                }
                break;
        }
    },
};
