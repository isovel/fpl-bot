import {
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
} from 'discord.js'

import ExtendedClient from '../../../class/ExtendedClient.js'

export default {
  structure: new ContextMenuCommandBuilder()
    .setName('Test Message command')
    .setType(3),
  /**
   * @param {ExtendedClient} client
   * @param {MessageContextMenuCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.reply({
      content:
        'This message was caused by right clicking onto a message and using the Test message command under the apps menu!',
    })
  },
}
