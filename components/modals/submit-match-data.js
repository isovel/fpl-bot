const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

//Do not forget the aggregate function in mongoDB

module.exports = {
    customId: 'submit-match-data',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {import('discord.js').AutocompleteInteraction} interaction
     */
    run: async (client, interaction) => {
        const userId = interaction.customId.split('_')[1];
        const gameMode = interaction.customId.split('_')[2];
        const msgId = interaction.customId.split('_')[3];

        const c_matches = client.runtimeVariables.db.collection('matches');

        let match = await c_matches.findOne({
            msgId: msgId,
        });

        if (!match) {
            return interaction.reply({
                content: 'Match code not set.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (match.resultData && match.resultData[userId]) {
            return interaction.reply({
                content:
                    'Match data for this users has already been submitted.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        let user = await client.users.fetch(userId);

        if (!user) {
            return interaction.reply({
                content: 'User not found.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        const placement = interaction.fields.getTextInputValue('placement');
        const kills = interaction.fields.getTextInputValue('kills');
        const assists = interaction.fields.getTextInputValue('assists');
        const deaths = interaction.fields.getTextInputValue('deaths');
        const combatScore =
            interaction.fields.getTextInputValue('combat-score');

        //validate placement, kills, assists, deaths, combat score
        const teams = client.config.gamemodes.find(
            (gm) => gm.value == gameMode
        ).teams;

        if (placement % 1 != 0 || placement < 1 || placement > teams) {
            return interaction.reply({
                content: `Please enter a valid placement (1-${teams})`,
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (kills % 1 != 0 || kills < 0) {
            return interaction.reply({
                content: 'Please enter a valid number of kills!',
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (assists % 1 != 0 || assists < 0) {
            return interaction.reply({
                content: 'Please enter a valid number of assists!',
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (deaths % 1 != 0 || deaths < 0) {
            return interaction.reply({
                content: 'Please enter a valid number of deaths!',
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (combatScore % 1 != 0 || combatScore < 0) {
            return interaction.reply({
                content: 'Please enter a valid combat score!',
                ephemeral: client.config.development.ephemeral,
            });
        }

        //save the data
        await c_matches
            .updateOne(
                {
                    msgId: msgId,
                },
                {
                    $set: {
                        [`resultData.${userId}`]: interaction.fields.fields.map(
                            (field) => ({
                                name: field.customId,
                                value: field.value,
                            })
                        ),
                    },
                }
            )
            .catch((err) => {
                log(err, 'error');
                return interaction.reply({
                    content: 'An error occured while saving the data.',
                    ephemeral: client.config.development.ephemeral,
                });
            });

        //check if all the users have submitted their data
        match = await c_matches.findOne({
            msgId: msgId,
        });

        const c_users = client.runtimeVariables.db.collection('users');

        interaction.message?.delete();

        if (
            match.resultData &&
            Object.keys(match.resultData).length == match.users.length
        ) {
            //calculate the points each user gets and update the user data
            /*
            Calculations:
            For every user create a variable with their kills and name. Then sort the variable by kills and give them 20/killsplacement points
            For every user create a variable with their kda and name. Then sort the variable by kda and give them 15/kdaplacement points
            For every user create a variable with their combat score and name. Then sort the variable by combat score and give them 15/combatscoreplacement points
            Give every user (50/teams)*placement points
            Give every user (10*rating)-10 points (ratings are saved in match.teamRatings)
            */

            let pointData = {};

            //calculate the points
            let kills = [];
            let kda = [];
            let combatScores = [];

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

            match.users.forEach((user) => {
                const data = match.resultData[user.id];

                kills.push({
                    id: user.id,
                    kills: parseInt(data.find((d) => d.name == 'kills').value),
                });

                kda.push({
                    id: user.id,
                    kda:
                        (parseInt(data.find((d) => d.name == 'kills').value) +
                            parseInt(
                                data.find((d) => d.name == 'assists').value
                            )) /
                        parseInt(data.find((d) => d.name == 'deaths').value),
                });

                combatScores.push({
                    id: user.id,
                    combatScore: parseInt(
                        data.find((d) => d.name == 'combat-score').value
                    ),
                });

                log(
                    `User ${user.id} gained ${
                        (50 / (teams - 1)) *
                        (teams - data.find((d) => d.name == 'placement').value)
                    } points for placement`,
                    'debug'
                );
                let pPoints =
                    (50 / (teams - 1)) *
                    (teams - data.find((d) => d.name == 'placement').value);
                pointData[user.id] = {
                    totalPoints: pPoints,
                    pointSources: [
                        {
                            source: 'Placement',
                            points: pPoints,
                            index: data.find((d) => d.name == 'placement')
                                .value,
                        },
                    ],
                };
            });

            kills.sort((a, b) => b.kills - a.kills);
            kda.sort((a, b) => b.kda - a.kda);
            combatScores.sort((a, b) => b.combatScore - a.combatScore);

            log(kills, 'debug', true);
            log(kda, 'debug', true);
            log(combatScores, 'debug', true);
            log(match.teamRatings, 'debug', true);

            kills.forEach((kill, index) => {
                log(
                    `User ${kill.id} gained ${
                        (20 / (kills.length - 1)) * (kills.length - 1 - index)
                    } points for kills`,
                    'debug'
                );
                let kPoints =
                    (20 / (kills.length - 1)) * (kills.length - 1 - index);
                pointData[kill.id].totalPoints += kPoints;
                pointData[kill.id].pointSources.push({
                    source: 'Kills',
                    points: kPoints,
                    index: index + 1,
                });
            });

            kda.forEach((k, index) => {
                log(
                    `User ${k.id} gained ${
                        (15 / (kda.length - 1)) * (kda.length - 1 - index)
                    } points for kda`,
                    'debug'
                );
                /*points[k.id] +=
                    (15 / (kda.length - 1)) * (kda.length - 1 - index);*/
                let kdaPoints =
                    (15 / (kda.length - 1)) * (kda.length - 1 - index);
                pointData[k.id].totalPoints += kdaPoints;
                pointData[k.id].pointSources.push({
                    source: 'kda',
                    points: kdaPoints,
                    index: index + 1,
                });
            });

            combatScores.forEach((cs, index) => {
                log(
                    `User ${cs.id} gained ${
                        (15 / (combatScores.length - 1)) *
                        (combatScores.length - 1 - index)
                    } points for combat score`,
                    'debug'
                );
                /*points[cs.id] +=
                    (15 / (combatScores.length - 1)) *
                    (combatScores.length - 1 - index);*/
                let csPoints =
                    (15 / (combatScores.length - 1)) *
                    (combatScores.length - 1 - index);
                pointData[cs.id].totalPoints += csPoints;
                pointData[cs.id].pointSources.push({
                    source: 'Combat Score',
                    points: csPoints,
                    index: index + 1,
                });
            });

            Object.keys(match.resultData).forEach((id) => {
                log(
                    `User ${id} gained ${
                        50 *
                        match.teamRatings.find((rating) => {
                            return (
                                rating.placement ==
                                match.resultData[id].find(
                                    (d) => d.name == 'placement'
                                ).value
                            );
                        }).objective
                    } points for rating`,
                    'debug'
                );
                /*points[id] +=
                    50 *
                    match.teamRatings.find((rating) => {
                        return (
                            rating.placement ==
                            match.resultData[id].find(
                                (d) => d.name == 'placement'
                            ).value
                        );
                    }).objective;*/
                let objPoints =
                    50 *
                    match.teamRatings.find((rating) => {
                        return (
                            rating.placement ==
                            match.resultData[id].find(
                                (d) => d.name == 'placement'
                            ).value
                        );
                    }).objective;
                pointData[id].totalPoints += objPoints;
                pointData[id].pointSources.push({
                    source: 'Objective',
                    points: objPoints,
                    index: match.resultData[id].find(
                        (d) => d.name == 'placement'
                    ).value,
                });
            });

            log(pointData, 'debug');

            //update the user data
            const u = await c_users.findOne({
                discordId: userId,
            });

            if (!u) {
                log('User not found in database (discordId).', 'warn');
                return interaction.reply({
                    content: 'User not found in database.',
                    ephemeral: client.config.development.ephemeral,
                });
            }

            Object.keys(pointData).forEach(async (id) => {
                c_users.updateOne(
                    {
                        discordId: id,
                    },
                    {
                        $inc: {
                            points: pointData[id].totalPoints,
                            matchesPlayed: 1,
                        },
                        //add match data to user
                        $push: {
                            matches: {
                                matchId: msgId,
                                resultData: match.resultData[id],
                                pointData: pointData[id],
                            },
                        },
                    }
                );

                member = await interaction.guild.members.fetch(id);

                //Error Here where user is not found (MAybe because member has to be fetched instead of user)

                /*
                You Got 10 Kills
                You Got 8 Assists
                You Got 3 Deaths
                Your Combat Score was 213231
                --------------
                Points Recieved: 113
                --------------
                Team Results: 1st - 50 Points
                Elimination Placement 1st - 20 Points
                KDA Placement 3rd - 10 points
                Combat Placement 1st - 15 points
                Objective Played: yes - 50 points
                */
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
                    match.resultData[id].find((d) => d.name == 'assists')
                        .value >
                    match.resultData[id].find((d) => d.name == 'deaths').value
                        ? match.resultData[id].find((d) => d.name == 'assists')
                              .value > 9
                            ? '-------------------'
                            : '------------------'
                        : match.resultData[id].find((d) => d.name == 'deaths')
                              .value > 9
                        ? '-------------------'
                        : '------------------';
                let embedData = [
                    `You got ${
                        match.resultData[id].find((d) => d.name == 'kills')
                            .value
                    } Kills`,
                    `You got ${
                        match.resultData[id].find((d) => d.name == 'assists')
                            .value
                    } Assists`,
                    `You got ${
                        match.resultData[id].find((d) => d.name == 'deaths')
                            .value
                    } Deaths`,
                    `Your Combat Score was ${
                        match.resultData[id].find(
                            (d) => d.name == 'combat-score'
                        ).value
                    }`,
                    seperator,
                    `Points Recieved: ${pointData[id].totalPoints}`,
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
                        userPointData.objective.index == 1 ? 'Yes' : 'No'
                    } - ${userPointData.objective.points} points`,
                ];

                if (client.config.development.enabled) {
                    member.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Match Data Analyzed')
                                .setDescription(embedData.join('\n'))
                                .setColor('Purple'),
                        ],
                    });
                }

                //Remove pulled role from user
                member.roles.remove(client.config.roles['fpl-pulled']);
            });

            //update the match status
            await c_matches.updateOne(
                {
                    msgId: msgId,
                },
                {
                    $set: {
                        status: 3,
                    },
                }
            );

            //reset pulled users
            const c_queues = client.runtimeVariables.db.collection('queues');

            const queue = await c_queues.findOne({
                division: match.division,
            });

            //increase weight of every user by 0.5 (Only call mongodb once)
            await c_queues.updateOne(
                {
                    division: match.division,
                },
                {
                    $inc: {
                        'users.$[].weight': 0.5,
                    },
                }
            );

            //update every user in div
            await c_users.updateMany(
                {
                    division: match.division,
                    discordId: {
                        $nin: queue.randomUsers.map((user) => user.id),
                    },
                },
                {
                    $inc: {
                        weight: 0.5,
                    },
                }
            );

            await c_queues.updateMany(
                {
                    discordId: {
                        $in: queue.randomUsers.map((user) => user.id),
                    },
                },
                {
                    $set: {
                        weight: '$defaultWeight',
                    },
                }
            );

            //for every pulled user reset their user weight and their queue weight to their default weight (only one call to mongodb)
            queue.randomUsers.forEach(async (user) => {
                //get the discord user
                user = await interaction.guild.members.fetch(user.id);

                //update the user weight
                let weight = 1;
                let specialRoles = [];
                client.config.roles.weightModify.forEach((role) => {
                    if (user.roles.cache.has(role.id)) {
                        weight += role.multiplier - 1;
                        specialRoles.push(role.name);
                    }
                });

                //update c_users and c_queues
                c_users.updateOne(
                    {
                        discordId: user.id,
                    },
                    {
                        $set: {
                            weight: weight,
                            defaultWeight: weight,
                            specialRoles: specialRoles,
                        },
                    }
                );

                c_queues.updateOne(
                    {
                        division: match.division,
                    },
                    {
                        $set: {
                            'users.$[element].weight': weight,
                        },
                    },
                    {
                        arrayFilters: [
                            {
                                'element.id': user.id,
                            },
                        ],
                    }
                );
            });

            await c_queues.updateOne(
                {
                    msgId: msgId,
                },
                {
                    $set: {
                        pulledUsers: [],
                    },
                }
            );

            //delete the message
            interaction.reply({
                content:
                    'All Match data has been submitted. The match has been analyzed and the points have been distributed. The match has been closed',
                ephemeral: client.config.development.ephemeral,
            });
        } else {
            interaction.reply({
                content: 'Match data has been submitted.',
                ephemeral: client.config.development.ephemeral,
            });
        }
    },
};
