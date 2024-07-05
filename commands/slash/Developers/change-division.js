const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('change-division')
        .setDescription('Change the division of a user.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user to change the division for.')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('division')
                .setDescription('The division to change to.')
                .setRequired(true)
                .addChoices(
                    config.divisions.map((d) => {
                        return { name: d.shortName, value: d.shortName };
                    })
                )
        )
        .addStringOption((option) =>
            option
                .setName('reason')
                .setDescription('The reason for changing the division.')
                .setRequired(false)
        )
        .addBooleanOption((option) =>
            option
                .setName('send-dm')
                .setDescription('Whether to send a DM to the user.')
                .setRequired(false)
        ),
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {import('discord.js').CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const user = interaction.options.getUser('user');
        const division = interaction.options.getString('division');
        const reason =
            interaction.options.getString('reason') || 'No reason provided.';
        const sendDm = interaction.options.getBoolean('send-dm');
        const c_users = client.runtimeVariables.db.collection('users');

        const userDoc = await c_users.findOne({ discordId: user.id });
        if (!userDoc) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('User Not Found')
                        .setDescription(
                            'The user was not found in the database.'
                        )
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (userDoc.division === division) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Division Not Changed')
                        .setDescription(
                            'The user is already in the specified division.'
                        )
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        try {
            let member = await interaction.guild.members.fetch(user.id);
            await member.roles.remove(
                client.config.roles.divisions[userDoc.division]
            );
            await member.roles.add(client.config.roles.divisions[division]);
            await c_users.updateOne(
                { discordId: user.id },
                { $set: { division } }
            );
            if (sendDm) {
                await user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Division Changed')
                            .setDescription(
                                `Your division has been changed to ${division} by a staff member.`
                            )
                            .addFields(
                                {
                                    name: 'Reason',
                                    value: reason,
                                },
                                {
                                    name: 'Staff Member',
                                    value: interaction.user.displayName,
                                }
                            )
                            .setColor('Green'),
                    ],
                });
            }
        } catch (error) {
            log(error, 'err');
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            'An error occurred while changing the division.'
                        )
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Division Changed')
                    .setDescription(
                        `The user's division has been changed to ${division}.`
                    )
                    .setColor('Green'),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
