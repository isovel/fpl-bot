import { EmbedBuilder, ModalSubmitInteraction } from 'discord.js'
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
  customId: 'send-application-2',
  /**
   *
   * @param {ExtendedClient} client
   * @param {ModalSubmitInteraction} interaction
   */
  run: async (client, interaction) => {
    log('Application form Nr. 2 submitted!', 'info')
    const wins = interaction.fields.getTextInputValue('wins')
    const losses = interaction.fields.getTextInputValue('losses')
    const eliminations = interaction.fields.getTextInputValue('eliminations')
    const deaths = interaction.fields.getTextInputValue('deaths')
    const playtime = interaction.fields.getTextInputValue('playtime')
    let isMember = false

    //validate wins, losses, eliminations, deaths, matches played
    if (!wins.match(/^[0-9]+$/)) {
      log(
        `${interaction.user.displayName} entered an invalid number of wins! ${wins}`,
        'warn'
      )
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription(
              `Please enter a valid number of wins! \nYou entered: ${wins}`
            )
            .setColor('Red'),
        ],
        ephemeral: true,
      })
      return
    }

    if (!losses.match(/^[0-9]+$/)) {
      log(
        `${interaction.user.displayName} entered an invalid number of losses! ${losses}`,
        'warn'
      )
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription(
              `Please enter a valid number of losses! \nYou entered: ${losses}`
            )
            .setColor('Red'),
        ],
        ephemeral: true,
      })
      return
    }

    if (!eliminations.match(/^[0-9]+$/)) {
      log(
        `${interaction.user.displayName} entered an invalid number of eliminations! ${eliminations}`,
        'warn'
      )
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription(
              `Please enter a valid number of eliminations! \nYou entered: ${eliminations}`
            )
            .setColor('Red'),
        ],
        ephemeral: true,
      })
      return
    }

    if (!deaths.match(/^[0-9]+$/)) {
      log(
        `${interaction.user.displayName} entered an invalid number of deaths! ${deaths}`,
        'warn'
      )
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription(
              `Please enter a valid number of deaths! \nYou entered: ${deaths}`
            )
            .setColor('Red'),
        ],
        ephemeral: true,
      })
      return
    }

    //validate playtime (whole number)
    if (!playtime.match(/^[0-9]+( hours|hr)?$/i)) {
      log(
        `${interaction.user.displayName} entered an invalid playtime! ${playtime}`,
        'warn'
      )
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription(
              `Please enter a valid playtime! \nYou entered: ${playtime}`
            )
            .setColor('Red'),
        ],
        ephemeral: true,
      })
      return
    }

    const prevData = interaction.customId.split('_')

    let weight = 1
    let specialRoles = []
    client.config.roles.weightModify.forEach((role) => {
      if (interaction.member.roles.cache.has(role.id)) {
        weight += role.multiplier - 1
        specialRoles.push(role.name)
      }
    })

    const userData = {
      createdAt: new Date(),
      discordId: interaction.user.id,
      embarkId: prevData[1].replaceAll('~', '_'),
      platform: prevData[4],
      lastRecordedRank: prevData[2],
      highestRecordedRank: prevData[3],
      seasonsPlayed: prevData[5],
      playtime: parseInt(playtime),
      wins: parseInt(wins),
      losses: parseInt(losses),
      eliminations: parseInt(eliminations),
      deaths: parseInt(deaths),
      kd: (eliminations / deaths).toFixed(2),
      matchesPlayed: parseInt(wins) + parseInt(losses),
      winrate: ((wins / (parseInt(wins) + parseInt(losses))) * 100).toFixed(2),
      specialRoles: specialRoles,
      weight: weight,
      defaultWeight: weight,
      applicationStatus: 1, // 0 = rejected, 1 = pending, 2 = accepted
    }

    //check if the user has the div a or div b role. If so accept them into the division

    log(
      `userData for ${interaction.user.displayName}: ${JSON.stringify(
        userData
      )}`,
      'debug'
    )

    //upload with mongodb (client.runtimeVariables.db)
    try {
      const c_users = client.runtimeVariables.db.collection('users')

      const result = await c_users.insertOne(userData)
    } catch (e) {
      if (e.code === 11000) {
        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle('Error')
              .setDescription('You have already submitted an application!')
              .setColor('Red'),
          ],
          ephemeral: true,
          components: [],
        })
        return
      }

      console.dir(e)

      log(e, 'err')
      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription(
              'An error occurred while submitting your application!'
            )
            .setColor('Red'),
        ],
        ephemeral: true,
        components: [],
      })
      return
    }

    interaction.member.roles.add(client.config.roles.pending)

    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle('Success')
          .setDescription(
            'Your application has been submitted successfully! Please wait for a response from our staff.'
          )
          .setColor('Green'),
      ],
      ephemeral: true,
      components: [],
    })
  },
}
