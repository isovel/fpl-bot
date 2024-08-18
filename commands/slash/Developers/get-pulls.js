import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import config from '../../../configurations.js'
import { log } from '../../../functions.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('get-pulls')
    .setDescription('Get the pulled users for a specific division.')
    .addStringOption((opt) =>
      opt
        .setName('division')
        .setDescription('The division to get the pulls for.')
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

    log(`Getting pulls for division ${division}`, 'info')

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

    if (queueData.randomUsers.length === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('No users have been pulled yet.')
            .setColor('Red'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Pulled Users')
          .setDescription(
            queueData.randomUsers.map((u) => `<@${u.id}>`).join('\n')
          )
          .setColor('Purple'),
      ],
      ephemeral: client.config.development.ephemeral,
    })
  },
}
