import chalk from 'chalk'
import ExtendedClient from '../../class/ExtendedClient.js'
import { log } from '../../functions.js'

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
    log(`Logged in as ${chalk.blue(client.user.tag)}`, 'done')
  },
}
