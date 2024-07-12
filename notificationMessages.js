const { EmbedBuilder } = require('discord.js');
const config = process.env.PRODUCTION
    ? require('./server-config')
    : require('./config');

const notificationMessages = new Map([
    [
        'applicationAccepted',
        {
            reason: 'Application',
            channel: config.channels.notifications.application,
            message: {
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Application Accepted')
                        .setDescription(
                            'Your application has been accepted. \nYou have been assigned to **division {{division}}**.'
                        )
                        .setColor('Green'),
                ],
            },
        },
    ],
    [
        'applicationDeclined',
        {
            reason: 'Application',
            channel: config.channels.notifications.application,
            message: {
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Application Declined')
                        .setDescription(
                            'We are sorry to inform you that your application has been declined. Please create a ticket in fpl-help for further information.'
                        )
                        .setColor('Red'),
                ],
            },
        },
    ],
    [
        'matchCodeSet',
        {
            reason: 'Match',
            channel: config.channels.notifications.match,
            message: {
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Match')
                        .setDescription(
                            `The match code for the match in division {{division}} is **{{matchCode}}**`
                        )
                        .setColor('Purple'),
                ],
            },
        },
    ],
    [
        'matchCodeUpdated',
        {
            reason: 'Match',
            channel: config.channels.notifications.match,
            message: {
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Match')
                        .setDescription(
                            `The match code for the match in division {{division}} has been **updated** to **{{matchCode}}**`
                        )
                        .setColor('Purple'),
                ],
            },
        },
    ],
    [
        'matchDataAnalyzed',
        {
            reason: 'Match',
            channel: config.channels.notifications.match,
        },
    ],
    [
        'divisionChanged',
        {
            reason: 'Division',
            channel: config.channels.notifications.division,
            message: {
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Division Changed')
                        .setDescription(
                            'You have been moved to **division {{division}}**.'
                        )
                        .setColor('Purple'),
                ],
            },
        },
    ],
]);

module.exports = notificationMessages;
