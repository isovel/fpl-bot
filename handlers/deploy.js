import { REST, Routes } from 'discord.js'
import ExtendedClient from '../class/ExtendedClient.js'
import config from '../configurations.js'
import { isSnowflake, log } from '../functions.js'

/**
 *
 * @param {ExtendedClient} client
 */
export default async (client) => {
  const rest = new REST({ version: '10' }).setToken(
    process.env.DISCORD_TOKEN || config.client.token
  )

  try {
    log('Deploying slash commands...', 'info')

    const guildId = process.env.GUILD_ID || config.development.guild

    if (config.development && config.development.deployToGuild && guildId) {
      if (!isSnowflake(guildId)) {
        log(
          'Guild ID is missing. Please set it in .env or the config, or disable development mode in the config',
          'err'
        )
        return
      }

      await rest.put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_CLIENT_ID || config.client.id,
          guildId
        ),
        {
          body: client.applicationcommandsArray,
        }
      )

      log(`Deployed slash commands to guild '${guildId}'`, 'done')
    } else {
      await rest.put(
        Routes.applicationCommands(
          process.env.DISCORD_CLIENT_ID || config.client.id
        ),
        {
          body: client.applicationcommandsArray,
        }
      )

      log('Deployed slash commands globally to Discord API.', 'done')
    }
  } catch (e) {
    log(`Unable to deploy slash commands to Discord API: ${e.message}`, 'err')
  }
}
