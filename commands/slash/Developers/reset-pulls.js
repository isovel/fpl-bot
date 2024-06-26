const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('reset-pulls')
        .setDescription('Reset the pulls for a specific division.')
        .addStringOption((opt) =>
            opt
                .setName('division')
                .setDescription('The division to reset the pulls for.')
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

        const c_queues = client.runtimeVariables.db.collection('queues');

        c_queues
            .updateOne(
                { division: division },
                {
                    $set: {
                        randomUsers: [],
                    },
                }
            )
            .then((result) => {
                log(result, 'debug');
                if (result.modifiedCount === 0 && result.upsertedCount === 0) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Warning')
                                .setDescription(
                                    `Pulls for division ${division} are already empty.`
                                )
                                .setColor('Yellow'),
                        ],
                        ephemeral: client.config.development.ephemeral,
                    });
                }

                log(result, 'debug');

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success')
                            .setDescription(
                                `Pulls for division ${division} have been reset.`
                            )
                            .setColor('Green'),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            });
    },
};
