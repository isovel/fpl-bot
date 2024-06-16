const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('clear-queue')
        .setDescription('Clear the queue for a specific division')
        .addStringOption((opt) =>
            opt
                .setName('division')
                .setDescription('The division to open the queue for.')
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

        log(`Clearing queue for division ${division}`, 'info');

        let c_queues = client.runtimeVariables.db.collection('queues');

        //upsert queue in db for division
        c_queues
            .updateOne(
                { division: division },
                {
                    $set: {
                        users: [],
                    },
                }
            )
            .then((result) => {
                log(result, 'debug');
                if (result.modifiedCount === 0 && result.upsertedCount === 0) {
                    return interaction.reply({
                        content: `Queue for division ${division} is already empty.`,
                        ephemeral: client.config.development.ephemeral,
                    });
                }

                log(result, 'debug');

                client.channels.cache.get(client.config.channels.queue).send({
                    content: `Queue for division ${division} has been cleared.`,
                    ephemeral: client.config.development.ephemeral,
                });
            })
            .catch((err) => {
                log(err, 'err');
                interaction.reply({
                    content:
                        'A Database error occurred while opening the queue.',
                    ephemeral: client.config.development.ephemeral,
                });
            });
    },
};
