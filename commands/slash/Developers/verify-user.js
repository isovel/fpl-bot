const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('verify-user')
        .setDescription('Approve the stats of a user.')
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

        if (userData.verified) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('User is already verified.')
                        .setColor('Red'),
                ],
            });
        }

        await c_users.updateOne(
            { discordId: user.id },
            { $set: { verified: true } }
        );

        //give user the verified role
        let fetchedUser = await interaction.guild.members.cache.get(user.id);
        fetchedUser.roles
            .add(client.config.roles['fpl-verified'])
            .then(async () => {
                fetchedUser.voice.setMute(false);
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success')
                            .setDescription(
                                `${user.username} has been verified.`
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
                            .setDescription('An error occurred.')
                            .setColor('Red'),
                    ],
                });
            });
    },
};
