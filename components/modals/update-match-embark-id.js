const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');
const {
    calculatePoints,
    submitPointData,
} = require('../../handlers/matchCalculations');
const { updateLeaderboard } = require('../../handlers/leaderboard');

module.exports = {
    customId: 'update-match-embarkid',
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
        const oldEmbarkId = interaction.customId
            .split('_')[3]
            .replaceAll('~', '_');
        const newEmbarkId = interaction.fields.getTextInputValue('embark-id');
        const objectivesPlayed = interaction.customId.split('_')[4].split(',');

        const confirmWords = ['yes', 'true', '1', 'ok', 'y', 'ye', 'yeah'];
        const denyWords = ['no', 'false', '0', 'n', 'nah', 'nope'];

        if (!newEmbarkId.match(/.{2,}#[0-9]{4}$/)) {
            log(
                `${interaction.user.displayName} entered an invalid Embark ID! ${embarkId}`,
                'warn'
            );
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            `Please enter a valid Embark ID! \nYou entered: ${embarkId} \nAn example would be: unknown#1234`
                        )
                        .setColor('Red'),
                ],
                ephemeral: true,
            });
            return;
        }

        const c_matchAnalysis =
            client.runtimeVariables.db.collection('matchAnalysis');

        log(analysisTimestamp, 'debug', true);

        let matchData = await c_matchAnalysis.findOne({
            timestamp: new Date(analysisTimestamp),
        });

        //change key matchData.playerData[oldEmbarkId] to matchData.playerData[newEmbarkId]

        await c_matchAnalysis
            .updateOne(
                {
                    timestamp: new Date(analysisTimestamp),
                },
                {
                    $rename: {
                        [`playerData.${oldEmbarkId.toLowerCase()}`]: `playerData.${newEmbarkId.toLowerCase()}`,
                    },
                }
            )
            .then((result) => {
                log(result, 'debug', true);
            });

        matchData.playerData[newEmbarkId.toLowerCase()] =
            matchData.playerData[oldEmbarkId.toLowerCase()];
        delete matchData.playerData[oldEmbarkId.toLowerCase()];

        log(matchData, 'debug', true);
        interaction.message.delete();

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
            objectivesPlayed.map((d) => {
                log(d, 'debug');
                if (d == 'y') return true;
                if (d == 'n') return false;
            })
        );

        log(pointData, 'debug', true);

        let playerDocs = new Map();

        c_users = client.runtimeVariables.db.collection('users');

        for await (const embarkId of pointData.keys()) {
            //use case insensitive search
            let userDocs = await c_users
                .find({
                    embarkId: {
                        $regex: new RegExp(
                            `^${
                                embarkId
                                    .split('#')[0]
                                    .replace(/0/g, '(O|0)')
                                    .replace(/(?<!\()(O)/gi, '(O|0)') +
                                '#' +
                                embarkId.split('#')[1]
                            }$`,
                            'i'
                        ),
                    },
                })
                .toArray();

            if (userDocs.length == 0) {
                log(
                    `User with embark ID ${embarkId} not found in the database`,
                    'warn'
                );
                //continue;
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                `User with embark ID ${embarkId} not found in the database`
                            )
                            .setColor('Red'),
                    ],
                    //button to change embarkId of specific user
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(
                                    `set-match-embarkid_${gamemode}_${analysisTimestamp}_${embarkId
                                        .replaceAll('_', '~')
                                        .replaceAll(
                                            ' ',
                                            ''
                                        )}_${objectivesPlayed}`
                                )
                                .setLabel('Set Embark ID')
                                .setStyle('Primary')
                                .setEmoji('🔄')
                        ),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            }
            if (userDocs.length > 1) {
                log(
                    `Multiple users with embark ID ${embarkId} found in the database`,
                    'warn'
                );
                //continue;
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

            if (userDocs[0].embarkId.toLowerCase() != embarkId.toLowerCase()) {
                matchData.playerData[userDocs[0].embarkId.toLowerCase()] =
                    matchData.playerData[embarkId.toLowerCase()];
                delete matchData.playerData[embarkId.toLowerCase()];

                pointData.set(
                    userDocs[0].embarkId.toLowerCase(),
                    pointData.get(embarkId)
                );
                pointData.delete(embarkId);
            }
            playerDocs.set(userDocs[0].embarkId, userDocs[0]);
        }

        //log amount of players found
        log(`Found ${playerDocs.size} players in the database`, 'debug', true);

        for await (const embarkId of playerDocs.keys()) {
            const playerData = matchData.playerData[embarkId.toLowerCase()];
            const playerPointData = pointData.get(embarkId.toLowerCase());
            const userDoc = playerDocs.get(embarkId);
            if (!playerData) {
                log(
                    `Player data for user with embark ID ${embarkId} not found in match data`,
                    'warn'
                );
                log(`Seaching for ${embarkId.toLowerCase()}`, 'debug');
                log(Object.keys(matchData.playerData), 'debug');
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                `Player data for user with embark ID ${embarkId} not found in match data`
                            )
                            .setColor('Red'),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            }
            if (!playerPointData) {
                log(
                    `Point data for user with embark ID ${embarkId} not found`,
                    'warn'
                );
                log(`Seaching for ${embarkId.toLowerCase()}`, 'debug');
                log([...pointData.keys()], 'debug');
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                `Point data for user with embark ID ${embarkId} not found`
                            )
                            .setColor('Red'),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            }
            if (!userDoc) {
                log(
                    `User with embark ID ${embarkId} not found in the database`,
                    'warn'
                );
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
        }
        for await (const embarkId of playerDocs.keys()) {
            const playerData = matchData.playerData[embarkId.toLowerCase()];
            const playerPointData = pointData.get(embarkId.toLowerCase());
            const userDoc = playerDocs.get(embarkId);
            const result = await submitPointData(
                client,
                userDoc,
                playerPointData,
                playerData,
                analysisTimestamp
            );

            if (!result) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                `An error occurred while submitting point data for user with embark ID ${embarkId}`
                            )
                            .setColor('Red'),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            }
        }

        //update all leaderboards
        client.config.divisions.forEach(async (division) => {
            updateLeaderboard(client, division.shortName);
        });

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
