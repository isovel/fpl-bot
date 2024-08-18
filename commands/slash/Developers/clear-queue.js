import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import config from '../../../configurations.js'
import { log } from '../../../functions.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('clear-queue')
    .setDescription('Clear the queue for a specific division')
    .addStringOption((opt) =>
      opt
        .setName('division')
        .setDescription('The division to open the queue for.')
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

    log(`Clearing queue for division ${division}`, 'info')

    let c_queues = client.runtimeVariables.db.collection('queues')

    //upsert queue in db for division
    c_queues
      .updateOne(
        { division: division },
        {
          $set: {
            users: [],
          },
        }
      )
      .then((result) => {
        log(result, 'debug')
        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Warning')
                .setDescription(
                  `Queue for division ${division} is already empty.`
                )
                .setColor('Yellow'),
            ],
            ephemeral: client.config.development.ephemeral,
          })
        }

        log(result, 'debug')

        const queueData = c_queues.findOne({
          division: division,
        })

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Success')
              .setDescription(
                `Queue for division ${division} has been cleared.\nThere are now ${queueData?.users?.length} users in the queue.`
              )
              .setColor('Green'),
          ],
          ephemeral: client.config.development.ephemeral,
        })
      })
      .catch((err) => {
        log(err, 'err')
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Error')
              .setDescription(
                'A Database error occurred while clearing the queue.'
              )
              .setColor('Red'),
          ],
          ephemeral: client.config.development.ephemeral,
        })
      })
  },
}
