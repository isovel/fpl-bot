import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { log } from '../../../functions'

const config = process.env.PRODUCTION
  ? require('../../../server-config')
  : require('../../../config')

export default {
  structure: new SlashCommandBuilder()
    .setName('get-queue-size')
    .setDescription('Get the size of the queue.')
    .addStringOption((opt) =>
      opt
        .setName('division')
        .setDescription('The division to get the queue size for.')
        .setRequired(true)
        .addChoices(
          config.divisions.map((d) => {
            return { name: d.shortName, value: d.shortName }
          })
        )
    ),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    const division = interaction.options.getString('division')

    log(`Getting queue size for division ${division}`, 'info')

    const c_queues = client.runtimeVariables.db.collection('queues')

    let queueData = await c_queues.findOne({
      division: division,
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

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Queue Size')
          .setDescription(`The queue size is ${queueData.users?.length || 0}.`)
          .setColor('Green'),
      ],
      ephemeral: client.config.development.ephemeral,
    })
  },
}
