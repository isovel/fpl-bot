import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { log } from '../../../functions'

export default {
  structure: new SlashCommandBuilder()
    .setName('revoke-application')
    .setDescription(
      'Set the status of an application of a user to pending and remove their division'
    )
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The user.').setRequired(true)
    ),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    const user = interaction.options.getUser('user') || interaction.user

    client.runtimeVariables.db
      .collection('users')
      .updateOne(
        {
          discordId: user.id,
        },
        {
          $set: {
            applicationStatus: 1,
            division: null,
          },
        }
      )
      .then((result) => {
        log(result, 'debug')

        if (result.matchedCount == 0) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Warning')
                .setDescription(
                  `${user.displayName} does not have an application.`
                )
                .setColor('Yellow'),
            ],
            ephemeral: client.config.development.ephemeral,
          })
        }
        if (result.modifiedCount == 0) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Warning')
                .setDescription(
                  `${user.displayName}'s application is already in pending status`
                )
                .setColor('Yellow'),
            ],
            ephemeral: client.config.development.ephemeral,
          })
        }

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Success')
              .setDescription(
                `The application of ${user.displayName} has been revoked.`
              )
              .setColor('Green'),
          ],
          ephemeral: client.config.development.ephemeral,
        })
      })
  },
}
