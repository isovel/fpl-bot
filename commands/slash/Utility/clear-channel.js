import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'
import ExtendedClient from '../../../class/ExtendedClient.js'

export default {
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
    await interaction.deferReply()

    const channel = interaction.channel

    if (!channel) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('This command can only be used in a channel.')
            .setColor('Red'),
        ],
        ephemeral: true,
      })
    }

    const messages = await channel.messages.fetch()

    Promise.all(messages.map((message) => message.delete()))
  },
}
