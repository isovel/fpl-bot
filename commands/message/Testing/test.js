const {
    MessageContextMenuCommandInteraction,
    ContextMenuCommandBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new ContextMenuCommandBuilder()
        .setName('Test Message command')
        .setType(3),
    /**
     * @param {ExtendedClient} client
     * @param {MessageContextMenuCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.reply({
            content:
                'This message was caused by right clicking onto a message and using the Test message command under the apps menu!',
        });
    },
};
