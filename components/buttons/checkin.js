import { EmbedBuilder } from 'discord.js'
import ExtendedClient from '../../class/ExtendedClient.js'
import { log } from '../../functions.js'

export default {
  customId: 'checkin',
  options: {
    public: true,
  },
  /**
   *
   * @param {ExtendedClient} client
   * @param {*} interaction
   */
  run: async (client, interaction) => {
    let division = interaction.customId.split('_')[1]

    //get user
    let user = await client.runtimeVariables.db
      .collection('users')
      .findOne({ discordId: interaction.user.id })
      .catch((error) => {
        log(error, 'err')
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Error')
              .setDescription('An error occurred while checking you in.')
              .setColor('Red'),
          ],
          ephemeral: true,
        })
      })
    if (!user) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Warn')
            .setDescription(
              'You have not yet sent an application. Go to the #fpl-register channel to send one.'
            )
            .setColor('Yellow'),
        ],
        ephemeral: true,
      })
    }
    log(division, 'debug')
    log(user.division, 'debug')
    if (!(user?.applicationStatus === 2)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Warn')
            .setDescription('Your application has not been accepted yet.')
            .setColor('Yellow'),
        ],
        ephemeral: true,
      })
    }
    if (!(user?.division === division)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Warn')
            .setDescription(`You are not a member of division ${division}.`)
            .setColor('Yellow'),
        ],
        ephemeral: true,
      })
    }
    let weight = user.weight || 1

    const c_queues = client.runtimeVariables.db.collection('queues')

    let queueData = await c_queues.findOne({
      division: division,
    })

    if (!queueData.open) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Queue Closed')
            .setDescription(
              `The queue for division ${division} is not open at the moment.`
            )
            .setColor('Yellow'),
        ],
        ephemeral: true,
      })
    }

    if (queueData.users?.find((u) => u.id === interaction.user.id)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Warn')
            .setDescription(`You are already checked in.`)
            .setColor('Yellow'),
        ],
        ephemeral: true,
      })
    }

    c_queues
      .updateOne(
        { division: division },
        {
          $addToSet: {
            users: {
              id: interaction.user.id,
              name: user.embarkId.slice(0, -5),
              weight,
            },
          },
        }
      )
      .then((result) => {
        log(result, 'debug')

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Checked In')
              .setDescription(`You have been checked in.`)
              .setColor('Green'),
          ],
          ephemeral: true,
        })
      })
      .catch((error) => {
        log(error, 'err')
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Error')
              .setDescription('An error occurred while checking you in.')
              .setColor('Red'),
          ],
          ephemeral: true,
        })
      })
  },
}
