const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
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
                        return { name: d.name, value: d.shortName };
                    })
                )
        ),
    options: {
        developers: true,
    },
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction<true>} interaction
     */
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
                        content: `Queue for division ${division} does not exist.`,
                        ephemeral: client.config.development.ephemeral,
                    });
                }
                if (result.modifiedCount == 0) {
                    return interaction.reply({
                        content: `Queue for division ${division} is already closed.`,
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
                    content: `Queue for division ${division} has been closed.`,
                    ephemeral: client.config.development.ephemeral,
                });
            })
            .catch((err) => {
                log(err, 'err');
                interaction.reply({
                    content: 'An error occurred while closing the queue.',
                    ephemeral: client.config.development.ephemeral,
                });
            });
    },
};
