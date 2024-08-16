import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js'
import setupFunctions from '../functions'
import api from '../handlers/api'
import commands from '../handlers/commands'
import components from '../handlers/components'
import deploy from '../handlers/deploy'
import events from '../handlers/events'
import { startClient } from '../handlers/mongodb'

const config = process.env.PRODUCTION
  ? require('../server-config')
  : require('../config')

log(
  `Loading ${process.env.PRODUCTION ? 'Production' : 'Development'} Server`,
  'info'
)

class ExtendedClient extends Client {
  collection = {
    interactioncommands: new Collection(),
    prefixcommands: new Collection(),
    aliases: new Collection(),
    components: {
      buttons: new Collection(),
      selects: new Collection(),
      modals: new Collection(),
      autocomplete: new Collection(),
    },
  }
  applicationcommandsArray = []
  runtimeVariables = {}
  config = config

  /**
   * / / object / list to be used in a call to any of the methods of the object
   */
  constructor(dir) {
    super({
      intents: Object.keys(GatewayIntentBits).map((a) => {
        return GatewayIntentBits[a]
      }), // Every intent
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.ThreadMember,
      ],
      presence: {
        /*activities: [
                    {
                        name: 'something goes here',
                        type: 4,
                        state: 'FFL Bot',
                    },
                ],*/
      },
    })
    this.__dirname = dir
  }

  start = async () => {
    commands(this)
    events(this)
    components(this)
    setupFunctions(this)
    api(this)

    // Set up the mongodb database.
    if (config.handler.mongodb.enabled)
      this.runtimeVariables.db = await startClient()

    //initialize runtime variables
    this.runtimeVariables.applicationSkips = []

    await this.login(process.env.DISCORD_LOGIN || config.client.token)

    // deploy this config to the handler
    if (config.handler.deploy) deploy(this, config)
  }
}

export default ExtendedClient
