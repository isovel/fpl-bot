import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'
import { ExtendedClient } from '../../../class/ExtendedClient'
import { log } from '../../../functions'
import {
  permHandler as _permHandler,
  notificationHandler,
} from '../../../handlers'

const permHandler = _permHandler['div-vc']

export default {
  structure: new SlashCommandBuilder()
    .setName('repull-user')
    .setDescription('Repull a specific user.')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The user.').setRequired(true)
    ),
  options: {
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const user = interaction.options.getMember('user')

    const c_users = client.runtimeVariables.db.collection('users')

    const userData = await c_users.findOne({ discordId: user.id })

    const c_queues = client.runtimeVariables.db.collection('queues')

    let queueData = await c_queues.findOne({
      division: userData.division,
    })

    if (!queueData) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('Queue not found in the database.')
            .setColor('Red'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }

    //check if there are more random users than pulled users
    if (queueData.users.length <= queueData.randomUsers.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Warning')
            .setDescription(
              `There are no more users to repull. Queue length: ${queueData.users.length}, Pulled users length: ${queueData.randomUsers.length}`
            )
            .setColor('Yellow'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }

    if (!(queueData.randomUsers.filter((u) => u.id === user.id).length > 0)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Warning')
            .setDescription('User not found in the queue.')
            .setColor('Yellow'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }

    //remove pulled role from user
    user.roles.remove(
      interaction.guild.roles.cache.get(client.config.roles.pulled)
    )

    //Remove permissions from user to access vc if exists
    //permHandler.reset(client, interaction, user, userData.division);

    //pull new random user from queue.users
    let randomUser
    while (!randomUser) {
      randomUser =
        queueData.users[Math.floor(Math.random() * queueData.users.length)]
      if (
        queueData.randomUsers.filter((u) => u.id === randomUser.id).length > 0
      ) {
        randomUser = null
      }
    }

    queueData.randomUsers.push(randomUser)
    //remove pulled user from random users
    queueData.randomUsers = queueData.randomUsers.filter(
      (u) => u.id !== user.id
    )

    //add pulled role to random user
    let pulledUser = await interaction.guild.members.fetch(randomUser.id)
    pulledUser.roles.add(
      interaction.guild.roles.cache.get(client.config.roles.pulled)
    )
    //set permissions for random user
    permHandler.setPulled(client, interaction, pulledUser, userData.division)

    const c_matches = client.runtimeVariables.db.collection('matches')

    log('MSGID: ' + queueData.pulledMsgId, 'debug')

    const match = await c_matches.findOne({
      division: userData.division,
      msgId: queueData.pulledMsgId,
    })

    log('MATCH: ' + match, 'debug')

    if (match && match.matchCode) {
      //send dm
      notificationHandler.notifyUser(client, pulledUser.id, 'matchCodeSet', {
        division: userData.division,
        matchCode: match.matchCode,
      })
    }

    await c_queues
      .bulkWrite([
        {
          updateOne: {
            filter: { division: userData.division },
            update: {
              $pull: { randomUsers: { id: user.id } },
            },
          },
        },
        {
          updateOne: {
            filter: { division: userData.division },
            update: {
              $addToSet: { randomUsers: randomUser },
            },
          },
        },
      ])
      .catch((err) => {
        log(err, 'err')
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Error')
              .setDescription(
                'An error occurred while writing to the database.'
              )
              .setColor('Red'),
          ],
          ephemeral: client.config.development.ephemeral,
        })
      })

    //update original message
    const channel = await interaction.guild.channels.fetch(
      queueData.pulledMsgChannelId
    )
    const msg = await channel.messages.fetch(queueData.pulledMsgId)

    msg.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle(msg.embeds[0].data.title)
          .setDescription(
            queueData.randomUsers.map((u) => `<@${u.id}>`).join('\n')
          )
          .setColor('Purple'),
      ],
      components: msg.components,
    })

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Success')
          .setDescription(
            `User ${user.displayName} has been repulled to ${pulledUser.displayName}.`
          )
          .setColor('Green'),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('configure-web-server_' + userData.division)
            .setLabel('Configure Web Server')
            .setStyle('Primary')
        ),
      ],
      ephemeral: client.config.development.ephemeral,
    })
  },
}
