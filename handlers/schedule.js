const schedule = require('node-schedule');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { log } = require('../functions');

let schedules = [];

let client;

const timesLookup = {
    1: 'first',
    2: 'second',
    3: 'third',
    4: 'fourth',
    5: 'fifth',
};

async function checkinUsers(match) {
    let c_users = client.runtimeVariables.db.collection('users');

    log('Checking in users for match ' + match.title);

    //create match in matches collection
    let c_matches = client.runtimeVariables.db.collection('matches');
    let id = Date.now();
    let matchData = await c_matches.insertOne({
        timezone: match.timezone,
        division: match.division,
        nr: match.nr,
        id,
        checkins: [],
    });

    //send check in message in queue channel (client.config.channels.queue.channel) with Check In button
    let embed = new EmbedBuilder()
        .setTitle('Check In')
        .setDescription(
            `The ${timesLookup[match.nr]} match for division ${
                match.division
            } on ${
                match.timezone
            } servers is now open.\nPress the Button to enter the Queue.\n` // ||<@&${client.config.roles.divisions[match.division]}>||
        )
        .setColor('Purple');
    let message = await client.channels.cache
        .get(client.config.channels.queue.channels[match.timezone])
        .send({
            embeds: [embed],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`checkin_${id}_${match.division}`)
                        .setLabel('Check In')
                        .setStyle('Primary')
                ),
            ],
        });
}

function selectRandomUsers(matchId) {
    //Choose 10 random users from checkins for matchId based on weight
    let c_matches = client.runtimeVariables.db.collection('matches');
    const usersAmount = 10;

    c_matches
        .findOne({ id: matchId })
        .then((match) => {
            let checkins = match.checkins;
            let users = [];
            for (let i = 0; i < 10; i++) {
                let totalWeight = 0;
                for (let checkin of checkins) {
                    totalWeight += checkin.weight;
                }
                let random = Math.floor(Math.random() * totalWeight);
                let currentWeight = 0;
                for (let checkin of checkins) {
                    currentWeight += checkin.weight;
                    if (currentWeight >= random) {
                        users.push(checkin.id);
                        break;
                    }
                }
            }
            return users;
        })
        .catch((err) => {
            log(err, 'err');
        });
}

function generateTestUsers(matchId) {
    //Generate 10 test users for matchId
    let c_matches = client.runtimeVariables.db.collection('matches');
    const usersAmount = 10;
    let users = [];
    for (let i = 0; i < usersAmount; i++) {
        users.push({
            //generate random id(19digits)
            id: Math.floor(Math.random() * 1000000000000000000),
            weight: Math.floor(Math.random() * 2) + 1,
        });
    }

    c_matches
        .updateOne(
            { id: matchId },
            {
                $addToSet: {
                    users,
                },
            }
        )
        .then((result) => {
            log(JSON.stringify(result, null, 2), 'info');
        })
        .catch((err) => {
            log(err, 'err');
        });
}

function subtractFromRecurrence(recurrenceData, minutes) {
    //Subtract minutes from the cronTime
    for (let i = 0; i < minutes; i++) {
        recurrenceData.minute--;
        if (recurrenceData.minute < 0) {
            recurrenceData.minute = 59;
            recurrenceData.hour--;
            if (recurrenceData.hour < 0) {
                recurrenceData.hour = 23;
                recurrenceData.dayOfWeek--;
                if (recurrenceData.dayOfWeek < 0) {
                    recurrenceData.dayOfWeek = 6;
                }
            }
        }
    }
    return recurrenceData;
}

function scheduleMatch(match) {
    //schedule client.config.times.checkInTimeOffset minutes before the match

    let recurrenceData = subtractFromRecurrence(
        match.recurrenceData,
        client.config.times.checkInTimeOffset
    );
    let recurrenceRule = new schedule.RecurrenceRule();
    recurrenceRule.dayOfWeek = recurrenceData.dayOfWeek;
    recurrenceRule.hour = recurrenceData.hour;
    recurrenceRule.minute = recurrenceData.minute;
    recurrenceRule.tz = recurrenceData.tz;
    let job = schedule.scheduleJob(recurrenceRule, () => {
        checkinUsers(match);
    });
    schedules.push(job);
}

module.exports = {
    run: (e_client) => {
        client = e_client;
        //schedule all matches from config
        for (const match of client.config.times.matches) {
            scheduleMatch(match);
        }
    },
};
