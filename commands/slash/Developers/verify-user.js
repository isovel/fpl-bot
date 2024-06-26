const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const permHandler = require('../../../handlers/permissions')['div-vc'];
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('verify-user')
        .setDescription('Approve the stats of a user.')
        .addUserOption((opt) =>
            opt.setName('user').setDescription('The user.').setRequired(true)
        ),
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        const user = interaction.options.getMember('user');

        const c_users = client.runtimeVariables.db.collection('users');

        const userData = await c_users.findOne({ discordId: user.id });

        if (!userData) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Warning')
                        .setDescription('User not found in the database.')
                        .setColor('Yellow'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }
        if (userData.verified) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Warning')
                        .setDescription('User is already verified.')
                        .setColor('Yellow'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        await c_users.updateOne(
            { discordId: user.id },
            { $set: { verified: true } }
        );

        //give user the verified role
        user.roles
            .add(client.config.roles['fpl-verified'])
            .then(async () => {
                user.voice.setMute(false);

                //reset unverified channel permissions
                permHandler.setVerified(
                    client,
                    interaction,
                    user,
                    userData.division
                );

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success')
                            .setDescription(
                                `${user.displayName} has been verified.`
                            )
                            .setColor('Green'),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            })
            .catch((err) => {
                log(err, 'err');
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription('An error occurred.')
                            .setColor('Red'),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            });
    },
};
