const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');

module.exports = {
    customId: 'mark-as-read',
    /**
     *
     * @param {ExtendedClient} client
     * @param {*} interaction
     */
    run: async (client, interaction) => {
        //archive thread
        interaction.channel
            .setArchived(true)
            .then(() => {
                try {
                    interaction.deferReply({
                        ephemeral: true,
                    });
                } catch (error) {}
            })
            .catch((err) => {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                'An error occurred while archiving the thread.'
                            )
                            .setColor('Red'),
                    ],
                    ephemeral: true,
                });
            });
    },
};
