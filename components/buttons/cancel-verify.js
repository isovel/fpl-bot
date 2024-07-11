const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');

module.exports = {
    customId: 'cancel-verify',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {*} interaction
     */
    run: async (client, interaction) => {
        const userId = interaction.customId.split('_')[1];
        const user = interaction.guild.members.cache.get(userId);

        //write message to use command /repull user on <@userId>
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('User Verification Cancelled')
                    .setDescription(
                        `Use the command \`/repull-user ${user.displayName}\` to repull the user.`
                    )
                    .setColor('Purple'),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
