import chalk from 'chalk'
import { readdirSync } from 'fs'
import ExtendedClient from '../class/ExtendedClient.js'
import { log } from '../functions.js'

/**
 *
 * @param {ExtendedClient} client
 */
export default async (client) => {
  let loadedComponents = []
  for (const dir of readdirSync('./components/').filter(
    (f) => !f.startsWith('.')
  )) {
    for (const file of readdirSync('./components/' + dir).filter((f) =>
      f.endsWith('.js')
    )) {
      const module = await import('../components/' + dir + '/' + file)
      if (!module) {
        log(
          `Unable to load module ${chalk.grey(
            file
          )} due to an unknown import error.`,
          'warn'
        )

        continue
      }

      const component = module?.default
      if (!component) {
        log(
          `Unable to load component ${chalk.grey(
            file
          )} due to missing ${chalk.grey('default')} export.`,
          'warn'
        )

        continue
      } else if (typeof component !== 'object') {
        log(
          `Unable to load component ${chalk.grey(file)} due to ${chalk.grey(
            'default'
          )} export not being an object.`,
          'warn'
        )

        continue
      } else if (!component.customId || !component.run) {
        log(
          `Unable to load component ${chalk.grey(
            file
          )} due to missing ${chalk.grey(
            'structure#customid'
          )} and/or ${chalk.grey('run')} properties.`,
          'warn'
        )

        continue
      }

      switch (dir) {
        case 'buttons':
          client.collection.components.buttons.set(
            component.customId,
            component
          )

          loadedComponents.push({
            type: 'button',
            customId: component.customId,
            file: file,
          })

          break
        case 'selects':
          client.collection.components.selects.set(
            component.customId,
            component
          )

          loadedComponents.push({
            type: 'select',
            customId: component.customId,
            file: file,
          })

          break
        case 'modals':
          client.collection.components.modals.set(component.customId, component)

          loadedComponents.push({
            type: 'modal',
            customId: component.customId,
            file: file,
          })

          break
        case 'autocomplete':
          client.collection.components.autocomplete.set(
            component.commandName,
            component
          )

          loadedComponents.push({
            type: 'autocomplete',
            commandName: component.commandName,
            file: file,
          })

          break
        default:
          log(
            `Unable to load component ${chalk.grey(
              file
            )} due to invalid component type.`,
            'warn'
          )

          continue
      }
    }
  }

  // Log each unique type of component that loads
  let uniqueTypes = [...new Set(loadedComponents.map((item) => item.type))]
  for (const type of uniqueTypes) {
    let typeComponents = loadedComponents.filter((item) => item.type === type)
    log(
      `Loaded ${chalk.greenBright(typeComponents.length)} ${chalk.grey(
        type
      )} component${typeComponents.length > 1 ? 's' : ''}`,
      'info'
    )
  }
}
