import ExtendedClient from '../../class/ExtendedClient'
import { log } from '../../functions'

export default {
  event: 'ready',
  once: true,
  /**
   *
   * @param {ExtendedClient} _
   * @param {import('discord.js').Client<true>} client
   * @returns
   */
  run: (_, client) => {
    log('Logged in as: ' + client.user.tag, 'done')
  },
}
