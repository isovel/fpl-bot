import { EmbedBuilder } from 'discord.js'
import ExtendedClient from '../../class/ExtendedClient'
import { time } from '../../functions'

const config = process.env.PRODUCTION
  ? require('../../server-config')
  : require('../../config')

export default {
  event: 'messageUpdate',
  /**
   *
   * @param {ExtendedClient} client
   * @param {import('discord.js').Message} oldMessage
   * @param {import('discord.js').Message} newMessage
   * @returns
   */
  run: async (client, oldMessage, newMessage) => {
    if (!(config.channels.modLogs.enabled && config.channels.modLogs.channel))
      return

    const modLogsChannel = client.channels.cache.get(
      config.channels.modLogs.channel
    )

    if (!modLogsChannel || modLogsChannel.guildId !== newMessage.guildId) return

    if (oldMessage.author.bot || newMessage.author.bot) return

    try {
      const data = [
        `**Old**: ${oldMessage.content}`,
        `**Updated**: ${newMessage.content}`,
        `**Author**: ${newMessage.author.toString()}`,
        `**Date**: ${time(Date.now(), 'D')} (${time(Date.now(), 'R')})`,
      ]

      await modLogsChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('Message Update')
            .setThumbnail(newMessage.author.displayAvatarURL())
            .setDescription(data.join('\n'))
            .setColor('Yellow'),
        ],
      })
    } catch (err) {
      console.error(err)
    }
  },
}
