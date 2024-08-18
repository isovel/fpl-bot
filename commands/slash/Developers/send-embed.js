import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { log } from '../../../functions.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('send-embed')
    .setDescription('Send an embed.')
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('The description of the embed.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('title').setDescription('The title of the embed.')
    )
    .addStringOption((option) =>
      option.setName('color').setDescription('The color of the embed.')
    ),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    const title = interaction.options.getString('title')
    const description = interaction.options.getString('description')
    const color = interaction.options.getString('color') || 'Default'

    log(color)

    let embed = new EmbedBuilder().setDescription(description).setColor(color)

    if (title) {
      embed.setTitle(title)
    }
    interaction.reply({
      embeds: [new EmbedBuilder().setDescription(description).setColor(color)],
      ephemeral: client.config.development.ephemeral,
    })
  },
}
