import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Get your stats (or the stats of a user).')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to get the stats of.')
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

    let kills = 0
    let deaths = 0
    let assists = 0
    let kda = 0
    let wins = 0
    let score = userDoc.points || 0

    userDoc.matches?.forEach((match) => {
      kills += match.resultData?.kills || match.playerData?.eliminations || 0
      deaths += match.resultData?.deaths || match.playerData?.deaths || 0
      assists += match.resultData?.assists || match.playerData?.assists || 0
      wins += match.win ? 1 : 0
    })

    kda = (kills + assists) / (deaths || 1) || 0

    const embedFields = [
      {
        name: 'Score',
        value: '' + Math.round(((score || 0) / 150) * 1000),
        inline: true,
      },
      {
        name: 'Kills',
        value: '' + kills,
        inline: true,
      },
      {
        name: 'Deaths',
        value: '' + deaths,
        inline: true,
      },
      {
        name: 'Assists',
        value: '' + assists,
        inline: true,
      },
      {
        name: 'KDA',
        value: '' + kda?.toFixed(2),
        inline: true,
      },
      {
        name: 'Wins',
        value: '' + wins,
        inline: true,
      },
    ]

    const embed = new EmbedBuilder()
      .setTitle('Stats')
      .setDescription(
        `Stats for ${user.username}\nMatches played: ${
          userDoc.fplMatchesPlayed || 0
        }`
      )
      .addFields(embedFields)
      .setColor('Purple')

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    })
  },
}
