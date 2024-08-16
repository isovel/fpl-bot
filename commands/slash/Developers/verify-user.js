import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('verify-user')
    .setDescription('Approve the stats of a user.')
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
            .setTitle('Warning')
            .setDescription('User not found in the database.')
            .setColor('Yellow'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }
    if (!userData.division) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Warning')
            .setDescription('User does not have a division.')
            .setColor('Yellow'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }
    if (userData.verified) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Warning')
            .setDescription('User is already verified.')
            .setColor('Yellow'),
        ],
        ephemeral: client.config.development.ephemeral,
      })
    }

    let embedData = [
      `Do you want to verify ${user.displayName}?`,
      `**Matches:** ${userData.matchesPlayed}`,
      `**Wins:** ${userData.wins}`,
      `**Losses:** ${userData.losses}`,
      `**Eliminations:** ${userData.eliminations}`,
      `**Deaths:** ${userData.deaths}`,
    ]

    //send message with user stats and ask for confirmation
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Verify User')
          .setDescription(embedData.join('\n'))
          .setColor('Purple'),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('verify-user_' + user.id)
            .setLabel('Verify')
            .setStyle('Success')
            .setEmoji('✅'),
          new ButtonBuilder()
            .setCustomId('cancel-verify_' + user.id)
            .setLabel('Cancel')
            .setStyle('Primary')
            .setEmoji('❌')
        ),
      ],
      ephemeral: client.config.development.ephemeral,
    })
  },
}
