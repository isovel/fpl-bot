const { EmbedBuilder } = require('discord.js');
const { notifyUser } = require('./notifications');

module.exports = {
    calculatePoints: async (playerData, teamsObjectivePlayed) => {
        /*
        playerData = new Map([
            {
                key: embarkid,
                value: {
                    teamName
                    teamPosition
                    teamCash
                    role
                    eliminations
                    assists
                    deaths
                    revives
                    support
                    objective
                }
            }
        ]);

        teamsObjectivePlayed = new Array([
            true,
            false,
            true,
            true
        ])
        */
        let pointData = new Map();

        let kills = [];
        let kda = [];
        let combatScores = [];

        playerData.forEach((value, key) => {
            kills.push({
                id: key,
                kills: value.eliminations,
            });

            kda.push({
                id: key,
                kda: (value.eliminations + value.assists) / value.deaths,
            });

            combatScores.push({
                id: key,
                combatScore: value.combat,
            });

            //placement points
            let pPoints =
                (50 / (teamsObjectivePlayed.length - 1)) *
                (teamsObjectivePlayed.length - value.teamPosition);
            pointData.set(key, {
                totalPoints: pPoints,
                pointSources: [
                    {
                        source: 'Placement',
                        points: pPoints,
                        index: value.teamPosition,
                    },
                ],
            });
        });

        kills.sort((a, b) => b.kills - a.kills);
        kda.sort((a, b) => b.kda - a.kda);
        combatScores.sort((a, b) => b.combatScore - a.combatScore);

        kills.forEach((kill, index) => {
            let kPoints =
                (20 / (kills.length - 1)) * (kills.length - 1 - index);
            pointData.get(kill.id).totalPoints += kPoints;
            pointData.get(kill.id).pointSources.push({
                source: 'Kills',
                points: kPoints,
                index: index + 1,
            });
        });

        kda.forEach((k, index) => {
            let kdaPoints = (15 / (kda.length - 1)) * (kda.length - 1 - index);
            pointData.get(k.id).totalPoints += kdaPoints;
            pointData.get(k.id).pointSources.push({
                source: 'kda',
                points: kdaPoints,
                index: index + 1,
            });
        });

        combatScores.forEach((cs, index) => {
            let csPoints =
                (15 / (combatScores.length - 1)) *
                (combatScores.length - 1 - index);
            pointData.get(cs.id).totalPoints += csPoints;
            pointData.get(cs.id).pointSources.push({
                source: 'Combat Score',
                points: csPoints,
                index: index + 1,
            });
        });

        playerData.forEach((value, key) => {
            let objPoints = 50 * teamsObjectivePlayed[value.teamPosition - 1];
            pointData.get(key).totalPoints += objPoints;
            pointData.get(key).pointSources.push({
                source: 'Objective',
                points: objPoints,
                index: teamsObjectivePlayed[value.teamPosition - 1],
            });
        });

        return pointData;
    },
    //submit point data for one user and calculate their new total points
    submitPointData: async (client, embarkId, pointData, playerData) => {
        return new Promise(async (resolve, reject) => {
            c_users = client.runtimeVariables.db.collection('users');

            let userDocs = await c_users.find({ embarkId }).toArray();

            if (userDocs.length == 0) {
                return reject('User not found');
            }
            if (userDocs.length > 1) {
                return reject('Multiple users found');
            }

            /*
             function calcGameImpact(x) {
                    return 19 * Math.pow(1.4, -x) + 1;
                }

                let pointDifference =
                    pointData[id].totalPoints - (u.points || 0);
                log(`Point difference for ${id}: ${pointDifference}`, 'debug');
                let gameImpact = calcGameImpact(u.fplMatchesPlayed || 0);
                log(`Game Impact for ${id}: ${gameImpact}`, 'debug');
                let pointChange = (pointDifference / 20) * gameImpact;
                log(`Point change for ${id}: ${pointChange}`, 'debug');

                c_users.updateOne(
                    {
                        discordId: id,
                    },
                    {
                        $inc: {
                            points: pointChange,
                            fplMatchesPlayed: 1,
                        },
                        //add match data to user
                        $push: {
                            matches: {
                                matchId: msgId,
                                timestamp: new Date(),
                                win: client.config.gamemodes
                                    .find((gm) => gm.value == gameMode)
                                    .winningTeams.includes(
                                        match.resultData[id]['placement']
                                    ),
                                resultData: match.resultData[id],
                                pointData: pointData[id],
                            },
                        },
                    }
                );

                member = await interaction.guild.members.fetch(id);

                let userPointData = {
                    placement: pointData[id].pointSources.find(
                        (source) => source.source == 'Placement'
                    ),
                    kills: pointData[id].pointSources.find(
                        (source) => source.source == 'Kills'
                    ),
                    kda: pointData[id].pointSources.find(
                        (source) => source.source == 'kda'
                    ),
                    combatScore: pointData[id].pointSources.find(
                        (source) => source.source == 'Combat Score'
                    ),
                    objective: pointData[id].pointSources.find(
                        (source) => source.source == 'Objective'
                    ),
                };
                let seperator =
                    match.resultData[id]['assists'] >
                    match.resultData[id]['deaths']
                        ? match.resultData[id]['assists'] > 9
                            ? '-------------------'
                            : '------------------'
                        : match.resultData[id]['deaths'] > 9
                        ? '-------------------'
                        : '------------------';
                let embedData = [
                    `You got ${match.resultData[id]['kills']} Kills`,
                    `You got ${match.resultData[id]['assists']} Assists`,
                    `You got ${match.resultData[id]['deaths']} Deaths`,
                    `Your Combat Score was ${match.resultData[id]['combat-score']}`,
                    seperator,
                    `Points Achieved: ${pointData[id].totalPoints}`,
                    //`Game Impact: ${Math.round(gameImpact)}`,
                    `Old Points: ${Math.round(u.points || 0)}`,
                    `Points Change: ${pointChange > 0 ? '+' : ''}${Math.round(
                        pointChange
                    )}`,
                    `New Points: ${Math.round((u.points || 0) + pointChange)}`,
                    seperator,
                    `Team Results: ${toNumStr(
                        userPointData.placement.index
                    )} - ${userPointData.placement.points} Points`,
                    `Elimination Placement: ${toNumStr(
                        userPointData.kills.index
                    )} - ${userPointData.kills.points} Points`,
                    `KDA Placement: ${toNumStr(userPointData.kda.index)} - ${
                        userPointData.kda.points
                    } points`,
                    `Combat Placement: ${toNumStr(
                        userPointData.combatScore.index
                    )} - ${userPointData.combatScore.points} points`,
                    `Objective Played: ${
                        userPointData.objective.index ? 'Yes' : 'No'
                    } - ${userPointData.objective.points} points`,
                ];

                //if (client.config.development.enabled)
                notificationHandler.notifyUser(
                    interaction,
                    id,
                    'matchDataAnalyzed',
                    undefined,
                    {
                        message: {
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Match Data Analyzed')
                                    .setDescription(embedData.join('\n'))
                                    .setColor('Purple'),
                            ],
                        },
                        noButton: true,
                    }
                );
            */

            let userDoc = userDocs[0];

            let pointDifference = pointData.totalPoints - (userDoc.points || 0);

            function calcGameImpact(x) {
                return 19 * Math.pow(1.4, -x) + 1;
            }

            let gameImpact = calcGameImpact(userDoc.fplMatchesPlayed || 0);

            let pointChange = (pointDifference / 20) * gameImpact;

            await c_users.updateOne(
                {
                    embarkId,
                },
                {
                    $inc: {
                        points: pointChange,
                        fplMatchesPlayed: 1,
                    },
                    $push: {
                        matches: {
                            matchId: embarkId,
                            timestamp: new Date(),
                            win: playerData.teamPosition == 1,
                            pointData,
                            playerData,
                            gameImpact,
                            pointChange,
                        },
                    },
                }
            );

            let userPointData = {
                placement: pointData.pointSources.find(
                    (source) => source.source == 'Placement'
                ),
                kills: pointData.pointSources.find(
                    (source) => source.source == 'Kills'
                ),
                kda: pointData.pointSources.find(
                    (source) => source.source == 'kda'
                ),
                combatScore: pointData.pointSources.find(
                    (source) => source.source == 'Combat Score'
                ),
                objective: pointData.pointSources.find(
                    (source) => source.source == 'Objective'
                ),
            };

            let seperator =
                playerData.assists > playerData.deaths
                    ? playerData[embarkId].assists > 9
                        ? '-------------------'
                        : '------------------'
                    : playerData[embarkId].deaths > 9
                    ? '-------------------'
                    : '------------------';

            let embedData = [
                `You got ${playerData.eliminations} Kills`,
                `You got ${playerData.assists} Assists`,
                `You got ${playerData.deaths} Deaths`,
                `Your Combat Score was ${playerData.combat}`,
                seperator,
                `Points Achieved: ${pointData.totalPoints}`,
                `Old Points: ${userDoc.points || 0}`,
                `Points Change: ${pointChange > 0 ? '+' : ''}${pointChange}`,
                `New Points: ${userDoc.points + pointChange}`,
                seperator,
                `Team Results: ${userPointData.placement.index} - ${userPointData.placement.points} Points`,
                `Elimination Placement: ${userPointData.kills.index} - ${userPointData.kills.points} Points`,
                `KDA Placement: ${userPointData.kda.index} - ${userPointData.kda.points} points`,
                `Combat Placement: ${userPointData.combatScore.index} - ${userPointData.combatScore.points} points`,
                `Objective Played: ${
                    userPointData.objective.index ? 'Yes' : 'No'
                } - ${userPointData.objective.points} points`,
            ];

            notifyUser(
                interaction,
                userDoc.discordId,
                'matchDataAnalyzed',
                undefined,
                {
                    message: {
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Match Data Analyzed')
                                .setDescription(embedData.join('\n'))
                                .setColor('Purple'),
                        ],
                    },
                }
            );

            return resolve(true);
        });
    },
};
