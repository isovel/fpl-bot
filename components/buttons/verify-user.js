import { EmbedBuilder } from 'discord.js'
import ExtendedClient from '../../class/ExtendedClient.js'
import { log } from '../../functions.js'

export default {
  customId: 'verify-user',
  options: {
    developers: true,
  },
  /**
   *
   * @param {ExtendedClient} client
   * @param {*} interaction
   */
  run: async (client, interaction) => {
    const userId = interaction.customId.split('_')[1]
    const user = interaction.guild.members.cache.get(userId)

    const c_users = client.runtimeVariables.db.collection('users')

    const userData = await c_users.findOne({ discordId: userId })

    await c_users.updateOne({ discordId: userId }, { $set: { verified: true } })

    //give user the verified role
    user.roles
      .add(client.config.roles.verified)
      .then(async () => {
        user.voice.setMute(false)

        //reset unverified channel permissions
        /*permHandler.setVerified(
                    client,
                    interaction,
                    user,
                    userData.division
                );*/

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Success')
              .setDescription(`${user.displayName} has been verified.`)
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
              .setDescription('An error occurred.')
              .setColor('Red'),
          ],
          ephemeral: client.config.development.ephemeral,
        })
      })
  },
}
