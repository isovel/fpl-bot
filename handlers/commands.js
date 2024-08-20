import { readdirSync } from 'fs'
import ExtendedClient from '../class/ExtendedClient.js'
import { log } from '../functions.js'

/**
 *
 * @param {ExtendedClient} client
 */
export default async (client) => {
  let loadedCommands = {}
  for (const type of readdirSync('./commands/').filter(
    (f) => !f.startsWith('.')
  )) {
    for (const dir of readdirSync('./commands/' + type).filter(
      (f) => !f.startsWith('.')
    )) {
      for (const file of readdirSync('./commands/' + type + '/' + dir).filter(
        (f) => f.endsWith('.js')
      )) {
        const module = await import(
          '../commands/' + type + '/' + dir + '/' + file
        )
        if (!module) {
          log(
            `Failed to load module '${file}' due to an unknown import error.`,
            'warn'
          )

          continue
        }

        const command = module?.default
        if (!command) {
          log(
            `Unable to load command '${file}' due to missing 'default' export.`,
            'warn'
          )

          continue
        } else if (typeof command !== 'object') {
          log(
            `Unable to load command '${file}' due to 'default' export not being an object.`,
            'warn'
          )

          continue
        } else if (!command.structure?.name || !command.run) {
          log(
            `Unable to load command '${file}' due to missing 'structure#name' and/or 'run' properties.`,
            'warn'
          )

          continue
        }

        if (type === 'prefix') {
          client.collection.prefixcommands.set(command.structure.name, command)

          if (
            command.structure.aliases &&
            Array.isArray(command.structure.aliases)
          ) {
            command.structure.aliases.forEach((alias) => {
              client.collection.aliases.set(alias, command.structure.name)
            })
          }
        } else {
          client.collection.interactioncommands.set(
            command.structure.name,
            command
          )
          client.applicationcommandsArray.push(command.structure)
        }

        if (!loadedCommands[dir]) loadedCommands[dir] = []
        loadedCommands[dir].push(file)
      }
    }
  }

  //loaded x commands of type y
  Array.from(Object.keys(loadedCommands)).forEach((type) => {
    log(
      `Loaded ${loadedCommands[type].length} command${
        loadedCommands[type].length > 1 ? 's' : ''
      } of type ${type}`,
      'info'
    )
  })
}
