const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');
const {
    calculatePoints,
    submitPointData,
} = require('../../handlers/matchCalculations');

module.exports = {
    customId: 'submit-team-ratings',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {*} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply();
        const gamemode = interaction.customId.split('_')[1];
        const analysisTimestamp = parseInt(interaction.customId.split('_')[2]);

        const confirmWords = ['yes', 'true', '1', 'ok', 'y', 'ye', 'yeah'];
        const denyWords = ['no', 'false', '0', 'n', 'nah', 'nope'];

        interaction.fields.fields.forEach((field) => {
            log(field, 'debug', true);
            if (
                !confirmWords.includes(field.value) &&
                !denyWords.includes(field.value) //!(parseInt(field.value) && field.value > 0 && field.value < 6)
            ) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Warn')
                            .setDescription(
                                `Please enter a valid response for Team ${
                                    field.customId.split('_')[1]
                                }`
                            )
                            .setColor('Yellow'),
                    ],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(
                                    `match-gamemode_${analysisTimestamp}_${gamemode}`
                                )
                                .setLabel('Try Again')
                                .setStyle('Primary')
                                .setEmoji('🔄')
                        ),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            }
        });

        const c_matchAnalysis =
            client.runtimeVariables.db.collection('matchAnalysis');

        log(analysisTimestamp, 'debug', true);

        const matchData = await c_matchAnalysis.findOne({
            timestamp: new Date(analysisTimestamp),
        });

        log(matchData, 'debug', true);

        if (!matchData || !matchData.playerData) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('Match data not found in database')
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        const pointData = await calculatePoints(
            new Map(Object.entries(matchData.playerData)),
            interaction.fields.fields.map((field) => {
                if (confirmWords.includes(field.value)) return true;
                if (denyWords.includes(field.value)) return false;
            })
        );

        log(pointData, 'debug', true);

        let playerDocs = new Map();

        c_users = client.runtimeVariables.db.collection('users');

        for await (const embarkId of pointData.keys()) {
            //use case insensitive search
            let userDocs = await c_users
                .find({
                    embarkId: { $regex: new RegExp(`^${embarkId}$`, 'i') },
                })
                .toArray();

            if (userDocs.length == 0) {
                log(
                    `User with embark ID ${embarkId} not found in the database`,
                    'warn'
                );
                continue;
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                `User with embark ID ${embarkId} not found in the database`
                            )
                            .setColor('Red'),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            }
            if (userDocs.length > 1) {
                log(
                    `Multiple users with embark ID ${embarkId} found in the database`,
                    'warn'
                );
                continue;
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                `Multiple users with embark ID ${embarkId} found in the database`
                            )
                            .setColor('Red'),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            }

            playerDocs.set(userDocs[0].embarkId, userDocs[0]);
        }

        //log amount of players found
        log(`Found ${playerDocs.size} players in the database`, 'debug', true);

        for await (const embarkId of playerDocs.keys()) {
            const result = await submitPointData(
                client,
                playerDocs.get(embarkId),
                pointData.get(embarkId.toLowerCase()),
                matchData.playerData[embarkId.toLowerCase()]
            );
        }

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success')
                    .setDescription('Point data submitted successfully.')
                    .setColor('Green'),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
