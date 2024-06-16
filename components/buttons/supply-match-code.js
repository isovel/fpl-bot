const {
    ModalBuilder,
    TextInputStyle,
    ActionRowBuilder,
    TextInputBuilder,
} = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

module.exports = {
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
        const division = interaction.customId.split('_')[1];

        //open modal
        interaction.showModal(
            new ModalBuilder()
                .setTitle('Supply Match Code')
                .setCustomId(
                    `set-match-code_${division}_${interaction.message.id}`
                )
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setLabel('Match Code')
                            .setCustomId('match-code')
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                    )
                )
        );
    },
};
