const {
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

module.exports = {
    customId: 'set-match-embarkid',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {*} interaction
     */
    run: async (client, interaction) => {
        interaction.showModal(
            new ModalBuilder()
                .setTitle(
                    `Change ${interaction.customId
                        .split('_')[3]
                        .replaceAll('~', '_')} embarkid`
                )
                .setCustomId(
                    `update-match-embarkid_${
                        interaction.customId.split('_')[1]
                    }_${interaction.customId.split('_')[2]}_${
                        interaction.customId.split('_')[3]
                    }_${interaction.customId.split('_')[4]}`
                )
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setLabel('Embark ID')
                            .setCustomId('embark-id')
                            .setPlaceholder('unkown#1234')
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                    )
                )
        );
    },
};
