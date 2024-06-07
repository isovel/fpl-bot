const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('clear-channel')
        .setDescription('Clears an entire channel!'),
    options: {
        ownerOnly: true,
    },
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply();

        const channel = interaction.channel;

        if (!channel) {
            return interaction.editReply({
                content: 'This command can only be used in a channel.',
                ephemeral: true,
            });
        }

        const messages = await channel.messages.fetch();

        Promise.all(messages.map((message) => message.delete()));
    },
};
