import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'
import ExtendedClient from '../../../class/ExtendedClient.js'

export default {
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
    })
  },
}
