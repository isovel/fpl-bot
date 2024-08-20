import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { notifications } from '../../../handlers/index.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('test-notifications')
    .setDescription('Test notifications.')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The user.').setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('notification')
        .setDescription('The notification to send.')
        .setRequired(true)
        .addChoices(
          Array.from(notifications.notificationMessages.keys()).map((key) => {
            return { name: key, value: key }
          })
        )
    )
    .addUserOption((opt) =>
      opt.setName('user2').setDescription('The second user.').setRequired(false)
    ),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    let user = interaction.options.getMember('user')
    let userIds = user.id
    if (interaction.options.getMember('user2')) {
      userIds = [user.id, interaction.options.getMember('user2').id]
    }
    const notificationId = interaction.options.getString('notification')

    const success = await notifications.notifyUser(
      client,
      userIds,
      notificationId,
      {
        division: 'A',
      }
    )
    if (success) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Success')
            .setDescription('Notification sent successfully.')
            .setColor('Green'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('An error occurred while sending the notification.')
            .setColor('Red'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }
  },
}
