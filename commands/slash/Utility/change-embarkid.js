import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { log } from '../../../functions'

export default {
  structure: new SlashCommandBuilder()
    .setName('change-embarkid')
    .setDescription('Change your embark id.')
    .addStringOption((option) =>
      option
        .setName('embarkid')
        .setDescription('Your new embark id.')
        .setRequired(true)
    ),

  run: async (client, interaction) => {
    const c_users = client.runtimeVariables.db.collection('users')
    const user = await c_users.findOne({
      discordId: interaction.user.id,
    })

    if (!user) {
      return interaction.reply({
        components: [],
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('You are not registered in the database.')
            .setColor('Red'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }

    const embarkId = interaction.options.getString('embarkid')

    if (!embarkId || !embarkId.match(/.{2,}#[0-9]{4}$/)) {
      return interaction.reply({
        components: [],
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('Please provide a valid embark id.')
            .setColor('Red'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }

    await c_users
      .updateOne(
        {
          discordId: interaction.user.id,
        },
        {
          $set: {
            embarkId,
          },
        }
      )
      .catch((e) => {
        log(e, 'warn')
        return interaction.reply({
          components: [],
          embeds: [
            new EmbedBuilder()
              .setTitle('Error')
              .setDescription(
                'An error occurred while updating your embark id.'
              )
              .setColor('Red'),
          ],
          ephemeral: client.config.development.ephemeral,
        })
      })

    interaction.reply({
      components: [],
      embeds: [
        new EmbedBuilder()
          .setTitle('Success')
          .setDescription('Your embark id has been updated.')
          .setColor('Green'),
      ],
      ephemeral: client.config.development.ephemeral,
    })
  },
}
