const { StringSelectMenuInteraction } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const viewApplications = require('../../commands/slash/Developers/view-applications');
const { log } = require('../../functions');

module.exports = {
    customId: 'application-action',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {StringSelectMenuInteraction} interaction
     */
    run: async (client, interaction) => {
        const value = interaction.values[0];
    },
};
