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
                        return { name: d.name, value: d.shortName };
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
        const amount = interaction.options.getInteger('amount') || 1;

        log(`Pulling ${amount} users from division ${division}`, 'info');

        const divisionConfig = config.divisions.find(
            (d) => d.shortName === division
        );

        const c_queues = client.runtimeVariables.db.collection('queues');

        //Get 10 random users(apply weight) from the queue

        let userData = (
            await c_queues.findOne({
                division: division,
            })
        ).users;

        if (userData.length < amount) {
            return interaction.reply({
                content: `There are not enough users in the queue. Current queue length: ${userData.length}`,
                ephemeral: client.config.development.ephemeral,
            });
        }

        let samples = [];
        let num_samples = amount;

        const users = userData.map((obj) => obj.user);
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
                    samples.push(users[i]);
                    weights[i] = 0;
                    break;
                }
            }
        }

        log(samples, 'debug');

        //send embed with users
        let embed = new EmbedBuilder()
            .setTitle(`Pulled ${amount} users from division ${division}`)
            .setDescription(samples.map((user) => `<@${user}>`).join('\n'));

        //with button to start web server
        interaction.reply({
            embeds: [embed],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('start-web-server_' + samples.join('_'))
                        .setLabel('Start Web Server')
                        .setStyle('Primary')
                ),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
