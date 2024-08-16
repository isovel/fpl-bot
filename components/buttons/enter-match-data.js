import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import ExtendedClient from '../../class/ExtendedClient'
import { log } from '../../functions'

export default {
  customId: 'enter-match-data',
  options: {
    developers: true,
  },
  /**
   *
   * @param {ExtendedClient} client
   * @param {*} interaction
   */
  run: async (client, interaction) => {
    const userId = interaction.customId.split('_')[1]
    const division = interaction.customId.split('_')[2]
    const gameMode = interaction.customId.split('_')[3]
    const msgId = interaction.customId.split('_')[4]

    const c_matches = client.runtimeVariables.db.collection('matches')

    const match = await c_matches.findOne({
      division: division,
      msgId: msgId,
    })

    if (!match) {
      return interaction.reply({
        content: 'Match code not set.',
        ephemeral: client.config.development.ephemeral,
      })
    }

    const user = await client.users.fetch(userId)

    log(user, 'debug', true)

    if (!user) {
      return interaction.reply({
        content: 'User not found.',
        ephemeral: client.config.development.ephemeral,
      })
    }

    const modal = new ModalBuilder()
      .setTitle(user.displayName)
      .setCustomId(`submit-match-data_${userId}_${gameMode}_${msgId}`)
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setLabel('TeamPlacement')
            .setCustomId('placement')
            .setPlaceholder(
              `The placement of the users team (1-${
                client.config.gamemodes.find((gm) => gm.value == gameMode).teams
              })`
            )
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setLabel('Kills')
            .setCustomId('kills')
            .setPlaceholder('The number of kills')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setLabel('Assists')
            .setCustomId('assists')
            .setPlaceholder('The number of assists')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setLabel('Deaths')
            .setCustomId('deaths')
            .setPlaceholder('The number of deaths')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setLabel('Combat Score')
            .setCustomId('combat-score')
            .setPlaceholder('The combat score')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        )
      )
    interaction.showModal(modal)
  },
}
