const {} = require('discord.js');
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
            content: `Use the command \`/repull-user ${user.displayName}\` to repull the user.`,
            ephemeral: client.config.development.ephemeral,
        });
    },
};
