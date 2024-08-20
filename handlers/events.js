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
          `Failed to load module '${file}' due to an unknown import error.`,
          'warn'
        )

        continue
      }

      const event = module?.default
      if (!event) {
        log(
          `Unable to load event '${file}' due to missing 'default' export.`,
          'warn'
        )

        continue
      } else if (typeof event !== 'object') {
        log(
          `Unable to load event '${file}' due to 'default' export not being an object.`,
          'warn'
        )

        continue
      } else if (!event.event || !event.run) {
        log(
          `Unable to load event '${file}' due to missing 'name' and/or 'run' properties.`,
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
      `Loaded ${loadedEvents[dir].length} event${
        loadedEvents[dir].length > 1 ? 's' : ''
      } for ${dir}.`,
      'info'
    )
  })
}
