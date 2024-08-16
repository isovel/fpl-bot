import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('send-application-message')
    .setDescription(
      'Send a message and the button to open the application form.'
    )
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('The text to display in the message.')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('button-text')
        .setDescription('The text to display in the button.')
        .setRequired(false)
    ),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    const text =
      interaction.options.getString('text') ||
      'Click the Button to open the Application form!'
    const buttonText =
      interaction.options.getString('button-text') || 'Open Application'

    await interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Application')
          .setDescription(text)
          .setColor('Purple'),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('open-application-modal')
            .setLabel(buttonText)
            .setStyle('Primary')
        ),
      ],
    })

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Success')
          .setDescription('Message sent successfully!')
          .setColor('Green'),
      ],
      ephemeral: client.config.development.ephemeral,
    })
  },
}
