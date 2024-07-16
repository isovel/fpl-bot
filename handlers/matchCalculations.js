const { EmbedBuilder } = require('discord.js');
const { notifyUser } = require('./notifications');
const { log } = require('../functions');

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
        log(teamsObjectivePlayed, 'debug', true);

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
            log(`value: ${JSON.stringify(value)}, key: ${key}`, 'debug', true);
            log(`Placement points for ${key}: ${pPoints}`, 'debug');
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

        log(pointData, 'debug', true);

        kills.sort((a, b) => b.kills - a.kills);
        kda.sort((a, b) => b.kda - a.kda);
        combatScores.sort((a, b) => b.combatScore - a.combatScore);

        kills.forEach((kill, index) => {
            let kPoints =
                (20 / (kills.length - 1)) * (kills.length - 1 - index);
            log(`Kills points for ${kill.id}: ${kPoints}`, 'debug');
            pointData.get(kill.id).totalPoints += kPoints;
            pointData.get(kill.id).pointSources.push({
                source: 'Kills',
                points: kPoints,
                index: index + 1,
            });
        });

        kda.forEach((k, index) => {
            let kdaPoints = (15 / (kda.length - 1)) * (kda.length - 1 - index);
            log(`KDA points for ${k.id}: ${kdaPoints}`, 'debug');
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
            log(`Combat Score points for ${cs.id}: ${csPoints}`, 'debug');
            pointData.get(cs.id).totalPoints += csPoints;
            pointData.get(cs.id).pointSources.push({
                source: 'Combat Score',
                points: csPoints,
                index: index + 1,
            });
        });

        playerData.forEach((value, key) => {
            let objPoints = 50 * teamsObjectivePlayed[value.teamPosition - 1];
            log(`Objective points for ${key}: ${objPoints}`, 'debug');
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
    submitPointData: async (
        client,
        userDoc,
        pointData,
        playerData,
        analysisTimestamp
    ) => {
        log(`submitting point data for ${userDoc.embarkId}`, 'debug');

        let pointDifference = pointData.totalPoints - (userDoc.points || 0);

        function calcGameImpact(x) {
            return 19 * Math.pow(1.4, -x) + 1;
        }

        let gameImpact = calcGameImpact(userDoc.fplMatchesPlayed || 0);

        let pointChange = (pointDifference / 20) * gameImpact;

        //check if analysisTimestamp has already been used
        if (
            userDoc.matches.find(
                (match) => match.timestamp == analysisTimestamp
            )
        ) {
            log('Match already analyzed', 'debug');
            return false;
        }

        await c_users.updateOne(
            {
                discordId: userDoc.discordId,
            },
            {
                $inc: {
                    points: pointChange,
                    fplMatchesPlayed: 1,
                },
                $push: {
                    matches: {
                        timestamp: new Date(analysisTimestamp),
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

        const seperator =
            playerData.assists > playerData.deaths
                ? playerData.assists > 9
                    ? '-------------------'
                    : '------------------'
                : playerData.deaths > 9
                ? '-------------------'
                : '------------------';

        function toNumStr(num) {
            switch (num) {
                case 1:
                    return '1st';
                case 2:
                    return '2nd';
                case 3:
                    return '3rd';
                default:
                    return `${num}th`;
            }
        }

        const embedData = [
            `You got ${playerData.eliminations} Kills`,
            `You got ${playerData.assists} Assists`,
            `You got ${playerData.deaths} Deaths`,
            `Your Combat Score was ${playerData.combat}`,
            seperator,
            `Score Achieved: ${Math.round(
                (pointData.totalPoints / 150) * 1000
            )}`,
            `Old Score: ${Math.round(((userDoc.points || 0) / 150) * 1000)}`,
            `Score Change: ${pointChange > 0 ? '+' : ''}${Math.round(
                ((pointChange || 0) / 150) * 1000
            )}`,
            `New Score: ${Math.round(
                (((userDoc.points || 0) + pointChange) / 150) * 1000
            )}`,
            seperator,
            `Total Points: ${Math.round(pointData.totalPoints)}/150`,
            `Team Results: ${toNumStr(
                userPointData.placement.index
            )} - ${Math.round(userPointData.placement.points)} Points`,
            `Elimination Placement: ${toNumStr(
                userPointData.kills.index
            )} - ${Math.round(userPointData.kills.points)} Points`,
            `KDA Placement: ${toNumStr(userPointData.kda.index)} - ${Math.round(
                userPointData.kda.points
            )} points`,
            `Combat Placement: ${toNumStr(
                userPointData.combatScore.index
            )} - ${Math.round(userPointData.combatScore.points)} points`,
            `Objective Played: ${
                userPointData.objective.index ? 'Yes' : 'No'
            } - ${userPointData.objective.points} points`,
        ];

        log(embedData, 'debug', true);

        await notifyUser(
            client,
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
        log('notified user', 'debug');

        return true;
    },
};
