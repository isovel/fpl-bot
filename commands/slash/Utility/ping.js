const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),
    options: {
        cooldown: 5000,
    },
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Pong!')
                    .setDescription(`Ping: ${client.ws.ping}ms`)
                    .setColor('Green'),
            ],
            ephemeral: true,
        });
    },
};
