const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('close-queue')
        .setDescription('Close the queue for a specific division')
        .addStringOption((opt) =>
            opt
                .setName('division')
                .setDescription('The division to close the queue for.')
                .setRequired(true)
                .addChoices(
                    config.divisions.map((d) => {
                        return { name: d.shortName, value: d.shortName };
                    })
                )
        ),
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        const division = interaction.options.getString('division');

        log(`Closing queue for division ${division}`, 'info');

        const divisionConfig = config.divisions.find(
            (d) => d.shortName === division
        );
        const c_queues = client.runtimeVariables.db.collection('queues');

        let queueData = await c_queues.findOne({
            division: division,
        });

        //upsert queue in db for division

        c_queues
            .updateOne(
                { division: division },
                {
                    $set: {
                        division: division,
                        open: false,
                        msgId: null,
                    },
                }
            )
            .then(async (result) => {
                log(result, 'debug');
                if (result.matchedCount == 0) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Error')
                                .setDescription(
                                    `Queue for division ${division} does not exist.`
                                )
                                .setColor('Red'),
                        ],
                        ephemeral: client.config.development.ephemeral,
                    });
                }
                if (result.modifiedCount == 0) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Warning')
                                .setDescription(
                                    `Queue for division ${division} is already closed.`
                                )
                                .setColor('Yellow'),
                        ],
                        ephemeral: client.config.development.ephemeral,
                    });
                }

                //remove queueData.msgId message
                if (queueData.msgId) {
                    let queueChannel = await client.channels.cache.get(
                        client.config.channels.queue
                    );
                    log(queueChannel, 'debug');
                    queueChannel.messages
                        .fetch(queueData.msgId)
                        .then((msg) => {
                            msg.delete();
                        })
                        .catch((err) => {
                            log(err, 'err');
                        });
                }

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success')
                            .setDescription(
                                `Queue for division ${division} has been closed.`
                            )
                            .setColor('Green'),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            })
            .catch((err) => {
                log(err, 'err');
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                'An error occurred while closing the queue.'
                            )
                            .setColor('Red'),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            });
    },
};
