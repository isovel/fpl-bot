const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('unverify-user')
        .setDescription('Remove the verification of a user.')
        .addUserOption((opt) =>
            opt.setName('user').setDescription('The user.').setRequired(true)
        ),
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const user = interaction.options.getUser('user');

        const c_users = client.runtimeVariables.db.collection('users');

        const userData = await c_users.findOne({ discordId: user.id });

        if (!userData) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('User not found in the database.')
                        .setColor('Red'),
                ],
            });
        }

        if (!userData.verified) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('User is not verified.')
                        .setColor('Red'),
                ],
            });
        }

        await c_users.updateOne(
            { discordId: user.id },
            { $set: { verified: false } }
        );

        //give user the verified role
        interaction.guild.members.cache
            .get(user.id)
            .roles.remove(client.config.roles['fpl-verified'])
            .then(() => {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success')
                            .setDescription(
                                `The verificationg of ${user.username} has been removed.`
                            )
                            .setColor('Green'),
                    ],
                });
            })
            .catch((err) => {
                log(err, 'err');
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                'An error occurred adding verified role to user.'
                            )
                            .setColor('Red'),
                    ],
                });
            });
    },
};
