import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('get-weight')
    .setDescription('Get your weight (or the weight of a user).')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to get the weight of.')
        .setRequired(false)
    ),
  run: async (client, interaction) => {
    const user = interaction.options.getUser('user') || interaction.user

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
            .setColor('Yellow'),
        ],
        ephemeral: true,
      })
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Weight')
          .setDescription(
            `The weight of <@${user.id}> is ${
              userDoc.weight || userDoc.defaultWeight
            }.`
          )
          .setColor('Green'),
      ],
      ephemeral: true,
    })
  },
}
