import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import ExtendedClient from '../../class/ExtendedClient'
import { log } from '../../functions'

/*
What is your Embark ID? (You can check this at https://id.embark.games/id/profile)

What was your last recorded rank? (Unranked, Bronze, Silver, Gold, Platinum, Diamond)

How much playtime do you have? (In-Game statistics not steam! In Hours)

Platform (PC, Playstation, Xbox)

Wins
Losses
Eliminations
Deaths
Matches Played

Sesons Played (CB1, CB2, OB1, S1, S2) (Seperate by comma)

What is your main Class? (Light, Medium, Heavy)

new ActionRowBuilder().addComponents(
  new TextInputBuilder()
    .setLabel('Embark ID')
    .setCustomId('embark-id')
    .setPlaceholder(
      'You can check this at https://id.embark.games/id/profile'
    )
    .setRequired(true)
),
new ActionRowBuilder().addComponents(
  new TextInputBuilder()
    .setLabel('Last Recorded Rank')
    .setCustomId('last-recorded-rank')
    .setPlaceholder(
      'Unranked, Bronze, Silver, Gold, Platinum, Diamond'
    )
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
),
new ActionRowBuilder().addComponents(
  new TextInputBuilder()
    .setLabel('Platform')
    .setCustomId('platform')
    .setPlaceholder('PC, Playstation, Xbox')
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
),
new ActionRowBuilder().addComponents(
  new TextInputBuilder()
    .setLabel('Seasons Played')
    .setCustomId('seasons-played')
    .setPlaceholder('CB1, CB2, OB1, S1, S2 (Seperate by comma)')
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
),
new ActionRowBuilder().addComponents(
  new TextInputBuilder()
    .setLabel('Playtime')
    .setCustomId('playtime')
    .setPlaceholder('In Hours')
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
),
*/

export default {
  customId: 'open-application-modal',
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    //check if user is already in the database
    let user = await client.runtimeVariables.db
      .collection('users')
      .findOne({ discordId: interaction.user.id })
      .catch((error) => {
        log(error, 'err')
        return interaction.reply({
          content: 'A database error occurred while checking you in.',
          ephemeral: true,
        })
      })

    if (user) {
      return interaction.reply({
        content: `You have already submitted an application that ${
          user.applicationStatus === 1
            ? 'is currently pending'
            : user.applicationStatus == 2
            ? 'has been accepted'
            : 'has been denied'
        }.`,
        ephemeral: true,
      })
    }

    const modal = new ModalBuilder()
      .setTitle('Application Form')
      .setCustomId('send-application')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setLabel('Embark ID')
            .setCustomId('embark-id')
            .setPlaceholder('unkown#1234')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setLabel('Main Platform')
            .setCustomId('platform')
            .setPlaceholder('PC, Playstation or Xbox (Only one)')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setLabel('Seasons Played')
            .setCustomId('seasons-played')
            .setPlaceholder('Alpha, CB1, CB2, OB1, S1, S2 (Seperate by comma)')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setLabel('Last Recorded Rank')
            .setCustomId('last-recorded-rank')
            .setPlaceholder(
              'e.g. Gold 3 (Unranked, Bronze, Silver, Gold, Platinum, Diamond)'
            )
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setLabel('Highest Recorded Rank+Season')
            .setCustomId('highest-recorded-rank')
            .setPlaceholder('Diamond 2 Closed beta 2')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        )
      )

    await interaction.showModal(modal)
  },
}
