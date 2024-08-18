//Remove chosen role from all users
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'
import ExtendedClient from '../../../class/ExtendedClient.js'
import { log } from '../../../functions.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('fix-pulled-roles')
    .setDescription(
      'Remove pulled role from all users and add pulled role to chosen users.'
    ),
  options: {
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    //for all discord users
    const members = await interaction.guild.members.fetch()
    const role = client.config.roles.pulled

    log(`Fixing pulled role from ${members.size} users.`, 'info')

    if (!role) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('Role not found.')
            .setColor('Red'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }
    log(`Removing pulled role from all users.`, 'info')
    await members.forEach((member) => {
      member.roles.remove(role)
    })

    const c_queues = client.runtimeVariables.db.collection('queues')

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Role Removed')
          .setDescription('Role removed from all users.')
          .setColor('Green'),
      ],
      ephemeral: client.config.development.ephemeral,
    })
  },
}
