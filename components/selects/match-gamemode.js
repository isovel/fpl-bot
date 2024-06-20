const {
    StringSelectMenuInteraction,
    ActionRowBuilder,
    ButtonBuilder,
} = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

module.exports = {
    customId: 'match-gamemode',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {StringSelectMenuInteraction} interaction
     */
    run: async (client, interaction) => {
        const gameMode = interaction.values[0];
        const division = interaction.customId.split('_').slice(1)[0];
        const msgId = interaction.customId.split('_').slice(2);

        log('Game Mode: ' + gameMode, 'debug');
        log(`Division: "${division}"`, 'debug');
        log(`Type: "${typeof division}"`, 'debug');

        //send a message to the interaction channel for every user prompting to enter their match data . Threre should be a Enter Data Button that opens a modal to enter the data.
        const c_queues = client.runtimeVariables.db.collection('queues');

        const queue = await c_queues.findOne({
            division: division,
        });

        log(queue, 'debug', true);

        if (!queue) {
            return interaction.reply({
                content: 'Queue not found.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (!queue.open) {
            return interaction.reply({
                content: 'Queue is not open.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (queue.randomUsers?.length < 1) {
            return interaction.reply({
                content: 'Queue is empty.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        interaction.reply({
            content: 'Match ended.',
            ephemeral: client.config.development.ephemeral,
        });

        queue.randomUsers.forEach((user) => {
            interaction.channel.send({
                content: `Enter data for ${user.name}`,
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(
                                `enter-match-data_${user.id}_${division}_${gameMode}_${msgId}`
                            )
                            .setLabel('Enter Data')
                            .setStyle('Primary')
                            .setEmoji('📊')
                    ),
                ],
            });
        });

        interaction.message.delete();
    },
};
