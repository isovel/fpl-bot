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
        .setName('open-queue')
        .setDescription('Open the queue for a specific division')
        .addStringOption((opt) =>
            opt
                .setName('division')
                .setDescription('The division to open the queue for.')
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

        log(`Opening queue for division ${division}`, 'info');

        const divisionConfig = config.divisions.find(
            (d) => d.shortName === division
        );

        let c_queues = client.runtimeVariables.db.collection('queues');

        //upsert queue in db for division
        c_queues
            .updateOne(
                { division: division },
                {
                    $set: {
                        division: division,
                        open: true,
                    },
                },
                { upsert: true }
            )
            .then((result) => {
                log(result, 'debug');
                if (result.modifiedCount === 0 && result.upsertedCount === 0) {
                    return interaction.reply({
                        content: `Queue for division ${division} is already open.`,
                        ephemeral: client.config.development.ephemeral,
                    });
                }
                //reset queue array
                c_queues
                    .updateOne(
                        { division: division },
                        {
                            $set: {
                                queue: [],
                            },
                        }
                    )
                    .then((result) => {
                        log(result, 'debug');

                        //send message
                        let embed = new EmbedBuilder()
                            .setTitle('Check In')
                            .setDescription(
                                `Check in for Division ${division} is now open. \nPress the Button to enter the Queue. \n||<@&${client.config.roles.divisions[division]}>||`
                            )
                            .setColor('Purple');
                        client.channels.cache
                            .get(client.config.channels.queue)
                            .send({
                                embeds: [embed],
                                components: [
                                    new ActionRowBuilder().addComponents(
                                        new ButtonBuilder()
                                            .setCustomId(`checkin_${division}`)
                                            .setLabel('Check In')
                                            .setStyle('Primary')
                                    ),
                                ],
                            });

                        interaction.reply({
                            content: `Queue for division ${division} has been opened.`,
                            ephemeral: client.config.development.ephemeral,
                        });
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
