import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('log-duplicate-entries')
    .setDescription('Log duplicate user entries in the database.'),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    const c_users = client.runtimeVariables.db.collection('users')
    const users = await c_users.find().toArray()
    const duplicateUsers = users.filter(
      (user, index, self) =>
        self.findIndex((t) => t.discordId === user.discordId) !== index
    )

    if (duplicateUsers.length === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('No Duplicate Entries')
            .setDescription('There are no duplicate entries in the database.')
            .setColor('Green'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }

    //log all duplicate entries in one message
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Duplicate Entries')
          .setDescription(
            `There are ${
              duplicateUsers.length
            } duplicate entries in the database. \n\n${duplicateUsers
              .map(
                (user) =>
                  `Discord ID: ${user.discordId} \nEmbark ID: ${user.embarkId} \n`
              )
              .join('')}
                        `
          )
          .setColor('Green'),
      ],
      ephemeral: client.config.development.ephemeral,
    })
  },
}
