import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'
import { log } from '../../../functions.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('replace-user')
    .setDescription('Replace a specific user with another user.')
    .addUserOption((opt) =>
      opt.setName('old-user').setDescription('The old user.').setRequired(true)
    )
    .addUserOption((opt) =>
      opt.setName('new-user').setDescription('The new user.').setRequired(true)
    ),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    const oldUser = interaction.options.getMember('old-user')
    const newUser = interaction.options.getMember('new-user')

    const c_users = client.runtimeVariables.db.collection('users')

    const oldUserData = await c_users.findOne({ discordId: oldUser.id })
    const newUserData = await c_users.findOne({ discordId: newUser.id })

    if (oldUserData?.division != newUserData?.division) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('Both users are not in the same division.')
            .setColor('Red'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }

    const c_queues = client.runtimeVariables.db.collection('queues')

    let queueData = await c_queues.findOne({
      division: oldUserData.division,
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

    if (
      !(queueData.randomUsers.filter((u) => u.id === oldUser.id).length > 0)
    ) {
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
    oldUser.roles.remove(
      interaction.guild.roles.cache.get(client.config.roles.pulled)
    )

    /*//Remove permissions from user to access vc if exists
        permHandler.reset(client, interaction, oldUser, oldUserData.division);

        //add pulled role to random user
        newUser.roles.add(client.config.roles.pulled);

        //set permissions for random user
        permHandler.setPulled(
            client,
            interaction,
            newUser,
            newUserData.division
        );*/

    const c_matches = client.runtimeVariables.db.collection('matches')

    log('MSGID: ' + queueData.pulledMsgId, 'debug')

    const match = await c_matches.findOne({
      division: oldUserData.division,
      msgId: queueData.pulledMsgId,
    })

    log('MATCH: ' + match, 'debug')

    if (
      match &&
      match.matchCode &&
      match.status == 1 &&
      !client.config.development.enabled
    ) {
      //send dm
      newUser.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('Match')
            .setDescription(
              `The match code for the match in division ${userData.division} is **${match.matchCode}**`
            )
            .setColor('Green'),
        ],
      })
    }
    /* .updateOne(
                { division: oldUserData.division },
                {
                    $addToSet: {
                        randomUsers: {
                            id: newUser.id,
                            name: newUserData.embarkId.slice(0, -5),
                            weight: newUserData.weight,
                        },
                    },
                    $pull: { randomUsers: { id: oldUser.id } },
                }
            )*/
    //remove old user and add new user
    await c_queues
      .bulkWrite([
        {
          updateOne: {
            filter: { division: oldUserData.division },
            update: {
              $pull: { randomUsers: { id: oldUser.id } },
            },
          },
        },
        {
          updateOne: {
            filter: { division: oldUserData.division },
            update: {
              $addToSet: {
                randomUsers: {
                  id: newUser.id,
                  name: newUserData.embarkId.slice(0, -5),
                  weight: newUserData.weight,
                },
              },
            },
          },
        },
      ])
      .catch((err) => {
        log(err, 'err')
        return interaction.reply({
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

    queueData = await c_queues.findOne({
      division: oldUserData.division,
    })

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
            `User ${oldUser.displayName} has been repulled to ${newUser.displayName}.`
          )
          .setColor('Green'),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('configure-web-server_' + newUserData.division)
            .setLabel('Configure Web Server')
            .setStyle('Primary')
        ),
      ],
      ephemeral: client.config.development.ephemeral,
    })
  },
}
