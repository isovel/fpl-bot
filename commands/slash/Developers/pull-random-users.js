const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('pull-random-users')
        .setDescription('Pull x amount of random users from the queue.')
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
        )
        .addIntegerOption((opt) =>
            opt
                .setName('amount')
                .setDescription('The amount of users to pull.')
                .setRequired(false)
                .setMinValue(1)
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
        const amount = interaction.options.getInteger('amount') || 10;

        const c_queues = client.runtimeVariables.db.collection('queues');

        let queueData = await c_queues.findOne({
            division: division,
        });
        //check if users have already been pulled
        if (queueData.randomUsers?.length > 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            `Random users have already been pulled for division ${division}.\n**Users**: ${queueData.randomUsers
                                .map((user) => user.name)
                                .join(', ')}`
                        )
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        log(`Pulling ${amount} users from division ${division}`, 'info');

        const divisionConfig = config.divisions.find(
            (d) => d.shortName === division
        );

        //Get 10 random users(apply weight) from the queue

        let userData = queueData.users;

        if (userData.length < amount) {
            return interaction.reply({
                content: `There are not enough users in the queue. Current queue length: ${userData.length}`,
                ephemeral: client.config.development.ephemeral,
            });
        }

        let samples = [];
        let num_samples = amount;

        const weights = userData.map((obj) => obj.weight);

        for (let _ = 0; samples.length < num_samples; _++) {
            const total_weight = weights.reduce(
                (sum, weight) => sum + weight,
                0
            );
            let random_weight = Math.random() * total_weight;

            for (let i = 0; i < weights.length; i++) {
                random_weight -= weights[i];
                if (random_weight <= 0) {
                    samples.push(userData[i]);
                    weights[i] = 0;
                    break;
                }
            }
        }

        log(samples, 'debug');

        //update queue data
        await c_queues.updateOne(
            {
                division: division,
            },
            {
                $set: {
                    randomUsers: samples,
                },
            }
        );

        //give all users the pulled role
        const pulledRole = interaction.guild.roles.cache.get(
            client.config.roles['fpl-pulled']
        );

        for (user of samples) {
            interaction.guild.members.cache
                .get(user.id)
                .roles.add(pulledRole)
                .catch((err) => {
                    log(err, 'err');
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Error')
                                .setDescription(
                                    'An error occurred adding pulled role to user.'
                                )
                                .setColor('Red'),
                        ],
                        ephemeral: client.config.development.ephemeral,
                    });
                });
        }

        //send embed with users
        let embed = new EmbedBuilder()
            .setTitle(`Pulled ${amount} users from division ${division}`)
            .setDescription(samples.map((user) => `<@${user.id}>`).join('\n'));

        //with button to start web server
        interaction.channel
            .send({
                reply: {
                    messageReference: interaction.interaction,
                },
                embeds: [embed],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(
                                'start-web-server_' +
                                    samples
                                        .map((u) => u.name.replaceAll('_', '~'))
                                        .join('_')
                            )
                            .setLabel('Start Web Server')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId(
                                'configure-vc_' +
                                    division +
                                    '_' +
                                    samples.map((u) => u.id).join('_')
                            )
                            .setLabel('Configure Vcs')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('supply-match-code_' + division)
                            .setLabel('Supply Match Code')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('start-match_' + division)
                            .setLabel('Start Match')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('end-match_' + division)
                            .setLabel('End Match')
                            .setStyle('Primary')
                    ),
                ],
                ephemeral: client.config.development.ephemeral,
            })
            .then((msg) => {
                interaction.reply({
                    content: '',
                    ephemeral: true,
                });
                c_queues.updateOne(
                    {
                        division: division,
                    },
                    {
                        $set: {
                            pulledMsgId: msg.id,
                        },
                    }
                );
            });
    },
};
