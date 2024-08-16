import { EmbedBuilder } from 'discord.js'
import { ObjectId } from 'mongodb'
import { log } from '../../functions'

export default {
  customId: 'delete-application',
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    //if selected is yes delete otherwise do nothing
    const value = interaction.values[0]
    const _id = interaction.customId.split('_')[1]
    if (value == 'yes') {
      log(`Deleting application with _ID ${_id}`, 'info')
      const result = await client.runtimeVariables.db
        .collection('users')
        .deleteOne({
          _id: new ObjectId(_id),
        })
      log(result, 'info')
      interaction.message.delete()
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Application Deleted')
            .setDescription(
              `The application has been deleted. \nResult: ${JSON.stringify(
                result
              )}`
            )
            .setColor('Green'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    } else {
      interaction.message.delete()
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Application Not Deleted')
            .setDescription('The application has not been deleted.')
            .setColor('Red'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }
  },
}
