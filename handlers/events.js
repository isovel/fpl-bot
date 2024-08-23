import chalk from 'chalk'
import { readdirSync } from 'fs'
import ExtendedClient from '../class/ExtendedClient.js'
import { log } from '../functions.js'

/**
 *
 * @param {ExtendedClient} client
 */
export default async (client) => {
  let loadedEvents = {}
  for (const dir of readdirSync('./events/').filter(
    (f) => !f.startsWith('.')
  )) {
    for (const file of readdirSync('./events/' + dir).filter((f) =>
      f.endsWith('.js')
    )) {
      const module = await import('../events/' + dir + '/' + file)
      if (!module) {
        log(
          `Failed to load module ${chalk.grey(
            file
          )} due to an unknown import error.`,
          'warn'
        )

        continue
      }

      const event = module?.default
      if (!event) {
        log(
          `Unable to load event ${chalk.grey(file)} due to missing ${chalk.grey(
            'default'
          )} export.`,
          'warn'
        )

        continue
      } else if (typeof event !== 'object') {
        log(
          `Unable to load event ${chalk.grey(file)} due to ${chalk.grey(
            'default'
          )} export not being an object.`,
          'warn'
        )

        continue
      } else if (!event.event || !event.run) {
        log(
          `Unable to load event ${chalk.grey(file)} due to missing ${chalk.grey(
            'name'
          )} and/or ${chalk.grey('run')} properties.`,
          'warn'
        )

        continue
      }

      if (!loadedEvents[dir]) loadedEvents[dir] = []
      loadedEvents[dir].push(file)

      if (event.once) {
        client.once(event.event, (...args) => event.run(client, ...args))
      } else {
        client.on(event.event, (...args) => event.run(client, ...args))
      }
    }
  }

  Array.from(Object.keys(loadedEvents)).forEach((dir) => {
    log(
      `Loaded ${chalk.greenBright(loadedEvents[dir].length)} ${chalk.grey(
        dir.toLowerCase()
      )} event handler${loadedEvents[dir].length > 1 ? 's' : ''}.`,
      'info'
    )
  })
}
