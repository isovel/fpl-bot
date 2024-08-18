import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'
import ExtendedClient from '../../../class/ExtendedClient.js'
import { log } from '../../../functions.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('testerror')
    .setDescription('Test what happens if an error occurs!'),
  options: {
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    log('This is a test error!', 'err')

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Success')
          .setDescription('Test error has been generated!')
          .setColor('Green'),
      ],
      ephemeral: true,
    })
  },
}
