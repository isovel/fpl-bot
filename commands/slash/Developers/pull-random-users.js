const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
} = require('discord.js');
const config = process.env.PRODUCTION
    ? require('../../../server-config')
    : require('../../../config');
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
                .setRequired(true)
                .setMinValue(1)
        ),
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        const division = interaction.options.getString('division');
        const amount = interaction.options.getInteger('amount');

        const c_queues = client.runtimeVariables.db.collection('queues');

        let queueData = await c_queues.findOne({
            division: division,
        });

        if (!queueData) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            `Queue data for division ${division} not found.`
                        )
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        //check if users have already been pulled
        if (queueData.randomUsers?.length > 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Warning')
                        .setDescription(
                            `Random users have already been pulled for division ${division}.\n**Users**: ${queueData.randomUsers
                                .map((user) => user.name)
                                .join(', ')}`
                        )
                        .setColor('Yellow'),
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
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Warning')
                        .setDescription(
                            `There are not enough users in the queue. Current queue length: ${userData.length}`
                        )
                        .setColor('Yellow'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        log(userData, 'debug');

        //update user data with weight modifiers
        const c_users = client.runtimeVariables.db.collection('users');
        await userData.forEach(
            async (user) =>
                await setTimeout(async () => {
                    let discordUser = await interaction.guild.members.fetch(
                        user.id
                    );

                    if (!discordUser) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Error')
                                    .setDescription(
                                        'An error occurred fetching user from guild.'
                                    )
                                    .setColor('Red'),
                            ],
                            ephemeral: client.config.development.ephemeral,
                        });
                    }

                    let weight = 1;
                    let specialRoles = [];
                    client.config.roles.weightModify.forEach((role) => {
                        if (discordUser.roles.cache.has(role.id)) {
                            weight += role.multiplier - 1;
                            specialRoles.push(role.name);
                        }
                    });

                    if (user.weight != weight) {
                        c_users.updateOne(
                            { discordId: discordUser.id },
                            {
                                $set: {
                                    weight: weight,
                                    defaultWeight: weight,
                                    specialRoles: specialRoles,
                                },
                            }
                        );

                        user.weight = weight;
                    }
                }, 25)
        );

        if (userData.length < amount) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Warning')
                        .setDescription(
                            `There are not enough users in the queue. Current queue length: ${userData.length}`
                        )
                        .setColor('Yellow'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        let samples = [];
        let num_samples = amount;

        log(userData, 'debug', true);

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
        const pulledRole = client.config.roles.pulled;

        for (user of samples) {
            let discordUser = await interaction.guild.members.fetch(user.id);

            await discordUser.roles.add(pulledRole).catch((err) => {
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
                            .setCustomId('configure-web-server_' + division)
                            .setLabel('Configure Web Server')
                            .setStyle('Primary'),
                        /*new ButtonBuilder()
                            .setCustomId('configure-vc_' + division)
                            .setLabel('Configure Vcs')
                            .setStyle('Primary'),*/
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
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success')
                            .setDescription(
                                `Pulled ${amount} users from division ${division}.`
                            )
                            .setColor('Green'),
                    ],
                    ephemeral: true,
                });
                c_queues.updateOne(
                    {
                        division: division,
                    },
                    {
                        $set: {
                            pulledMsgId: msg.id,
                            pulledMsgChannelId: msg.channel.id,
                        },
                    }
                );
            });
    },
};
