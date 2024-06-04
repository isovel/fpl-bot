const schedule = require('node-schedule');
const { EmbedBuilder } = require('discord.js');
const { log } = require('../functions');

let schedules = [];

let client;

async function checkinUsers(match) {
    //Send a message to all users in this division and timezone that they need to check in with a button to do so
    //If they don't check in within client.config.times.checkInEndOffset minutes, send a message that check in is now closed
    let c_users = client.runtimeVariables.db.collection('users');

    log('Checking in users for match ' + match.title);

    let search = {
        timezones: match.timezone,
        division: parseInt(match.division),
    };

    let users = await c_users.find(search).toArray();
    log('Search: ' + JSON.stringify(search, null, 2), 'info');
    log('Users found: ' + users.length, 'info');

    for (const user of users) {
        client.channels.cache
            .get(user.dmChannel)
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Check in')
                        .setDescription(
                            `You have a match in ${match.division} in ${match.timezone} in ${client.config.times.checkInTimeOffset} minutes.`
                        )
                        .addField('Match', match.title)
                        .addField('Comment', match.comment)
                        .setColor('Purple'),
                ],
            })
            .then((msg) => {
                msg.react('✅');
                schedules.push(
                    schedule.scheduleJob(
                        addMinutes(
                            new Date(),
                            client.config.times.checkInEndOffset
                        ),
                        () => {
                            msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle('Check in')
                                        .setDescription(
                                            `Check in for the match in ${match.division} in ${match.timezone} is now closed.`
                                        )
                                        .addField('Match', match.title)
                                        .addField('Comment', match.comment)
                                        .setColor('RED'),
                                ],
                            });
                        }
                    )
                );
            });
    }
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

    console.log(match);
    let recurrenceData = subtractFromRecurrence(
        match.recurrenceData,
        client.config.times.checkInTimeOffset
    );
    console.log('RecurrenceData', recurrenceData);
    let recurrenceRule = new schedule.RecurrenceRule();
    recurrenceRule.dayOfWeek = recurrenceData.dayOfWeek;
    recurrenceRule.hour = recurrenceData.hour;
    recurrenceRule.minute = recurrenceData.minute;
    recurrenceRule.tz = recurrenceData.tz;
    console.log('Rule', recurrenceRule);
    let job = schedule.scheduleJob(recurrenceRule, () => {
        checkinUsers(match);
    });
    console.log('Job', job);
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
