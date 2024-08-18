import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { log } from '../../../functions.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('unverify-user')
    .setDescription('Remove the verification of a user.')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The user.').setRequired(true)
    ),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    const user = interaction.options.getMember('user')

    const c_users = client.runtimeVariables.db.collection('users')

    const userData = await c_users.findOne({ discordId: user.id })

    if (!userData) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('User not found in the database.')
            .setColor('Red'),
        ],
      })
    }

    if (!userData.verified) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('User is not verified.')
            .setColor('Red'),
        ],
      })
    }

    await c_users.updateOne(
      { discordId: user.id },
      { $set: { verified: false } }
    )

    //Remove the verified role
    user.roles
      .remove(client.config.roles.verified)
      .then(() => {
        //reset vc permissions
        /*permHandler.setUnverified(
                    client,
                    interaction,
                    user,
                    userData.division
                );*/

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Success')
              .setDescription(
                `The verificationg of ${user.displayName} has been removed.`
              )
              .setColor('Green'),
          ],
        })
      })
      .catch((err) => {
        log(err, 'err')
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Error')
              .setDescription('An error occurred adding verified role to user.')
              .setColor('Red'),
          ],
        })
      })
  },
}
