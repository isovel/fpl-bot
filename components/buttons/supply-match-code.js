import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import ExtendedClient from '../../class/ExtendedClient'

export default {
  customId: 'supply-match-code',
  options: {
    developers: true,
  },
  /**
   *
   * @param {ExtendedClient} client
   * @param {*} interaction
   */
  run: async (client, interaction) => {
    const division = interaction.customId.split('_')[1]

    //open modal
    interaction.showModal(
      new ModalBuilder()
        .setTitle('Supply Match Code')
        .setCustomId(`set-match-code_${division}_${interaction.message.id}`)
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setLabel('Match Code')
              .setCustomId('match-code')
              .setRequired(true)
              .setStyle(TextInputStyle.Short)
          )
        )
    )
  },
}
