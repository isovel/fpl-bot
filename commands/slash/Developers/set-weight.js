import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { log } from '../../../functions'

export default {
  structure: new SlashCommandBuilder()
    .setName('set-weight')
    .setDescription('Set the weight of a user.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to set the weight of.')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('weight')
        .setDescription('The weight to set.')
        .setRequired(true)
    ),
  run: async (client, interaction) => {
    const user = interaction.options.getUser('user') || interaction.member
    const weight = interaction.options.getInteger('weight')

    //check if user has an application
    const c_users = client.runtimeVariables.db.collection('users')
    const userDoc = await c_users.findOne({
      discordId: user.id,
    })

    if (!userDoc) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('User not found in the database.')
            .setColor('Red'),
        ],
        ephemeral: true,
      })
    }

    log(`User weight: ${weight}`, 'debug')

    await c_users.updateOne(
      { discordId: user.id },
      {
        $set: {
          weight: weight,
        },
      }
    )

    const c_queues = client.runtimeVariables.db.collection('queues')

    let queueData = await c_queues.findOne({
      division: userDoc.division,
    })

    if (queueData.open && queueData.users.find((u) => u.id === user.id)) {
      //update queue
      await c_queues.updateOne(
        {
          division: userDoc.division,
        },
        {
          $set: {
            'users.$[elem].weight': weight,
          },
        },
        {
          arrayFilters: [{ 'elem.id': user.id }],
        }
      )
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Weight Updated')
          .setDescription(`The weight has been updated to **${weight}**.`)
          .setColor('Green'),
      ],
      ephemeral: true,
    })
  },
}
