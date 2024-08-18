import {
  ActionRowBuilder,
  ButtonBuilder,
  ChannelType,
  ThreadAutoArchiveDuration,
} from 'discord.js'
import { log } from '../functions.js'
import notificationMessages from '../notificationMessages.js'

//THis module handles notifying users of various events. This is a replacement to sending them a dm. The bot creates a new thread for in a specified notification channel(changes based on notification) and tags the users in a message.

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 * @param {*} userId
 * @param {*} notificationId
 */
export const channels = Array.from(notificationMessages.values()).map(
  (notification) => notification.channel
)
export const notifyUser = async (
  client,
  userId,
  notificationId,
  data,
  options
) => {
  let users = [],
    user
  const guild = await client.guilds.fetch(process.env.GUILD_ID)
  if (typeof userId == 'object') {
    userId.forEach(async (id) => {
      user = await guild.members.fetch(id)
      if (!user) {
        log(`User ${id} not found`, 'error')
        return
      }
      users.push(user)
    })
  } else {
    user = await guild.members.fetch(userId)
    if (!user) {
      log(`User ${userId} not found`, 'error')
      return
    }
  }
  let notification = notificationMessages.get(notificationId)
  if (!notification) {
    log(
      `Notification ${notificationId} not found in notificationMessages`,
      'error'
    )
    return
  }
  const channel = await guild.channels.fetch(notification.channel)
  if (!channel) {
    log(`Channel ${notification.channel} not found in guild cache`, 'error')
    return
  }

  if (options?.message) {
    notification.message = options.message
  }

  log(`Creating thread for reason ${notification.reason}.`, 'info')

  //Create thread
  const thread = await channel.threads.create({
    name: notification.message.embeds[0].data.title,
    invitable: false,
    autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
    type: ChannelType.PrivateThread,
  })
  if (data)
    Object.keys(data)?.forEach((key) => {
      notification.message.embeds[0].setDescription(
        notification.message.embeds[0].data.description.replace(
          `{{${key}}}`,
          data[key]
        )
      )
    })
  if (!options?.noButton)
    notification.message.components = [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Mark as read')
          .setStyle('Primary')
          .setCustomId('mark-as-read')
      ),
    ]
  thread.send(notification.message)
  log(`Thread created`, 'info')
  if (typeof userId == 'object') {
    await users.map(async (u) => {
      await thread.members.add(u)
    })
  } else {
    await thread.members.add(user)
  }
  log(`Users added to thread`, 'info')
  return thread.id
}

export { notificationMessages }
