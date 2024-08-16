import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import notificationHandler from '../../../handlers/notifications'

export default {
  structure: new SlashCommandBuilder()
    .setName('delete-notifications')
    .setDescription('Delete all notifications for a channel.')
    .addStringOption((opt) =>
      opt
        .setName('channel')
        .setDescription('The channel.')
        .setRequired(true)
        .addChoices(
          notificationHandler.channels.map((channel) => {
            return { name: channel, value: channel }
          })
        )
    ),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    const channel = interaction.options.getString('channel')

    const dcChannel = interaction.guild.channels.fetch(channel)

    //delete all threads in the channel
    await interaction.guild.channels.cache
      .filter((c) => c.parentId == channel)
      .forEach((c) => c.delete())

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Notifications Deleted')
          .setDescription(`Deleted notifications.`)
          .setColor('Green'),
      ],
      ephemeral: client.config.development.ephemeral,
    })
  },
}
