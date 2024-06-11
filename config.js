module.exports = {
    client: {
        token: process.env.DISCORD_TOKEN,
        id: process.env.DISCORD_CLIENT_ID,
    },
    handler: {
        prefix: 'ff_',
        deploy: true,
        commands: {
            prefix: true,
            slash: true,
            user: true,
            message: true,
        },
        mongodb: {
            enabled: true,
            uri: process.env.MONGODB_URI,
        },
        errors: 'owner', // "owner" or "developers"
    },
    users: {
        developers: [
            '738346395416789022',
            '457236806853853185',
            '912074676505812994',
        ],
        ownerId: '738346395416789022',
    },
    channels: {
        modLogs: {
            enabled: false,
            channel: '1246810115479310427',
        },
        queue: '1247568667550421092',
        voice: {
            divisions: {
                verified: {
                    'A': '1249766792763543637',
                    'B': '1250118891666018314',
                },
                unverified: {
                    'A': '1250130019448127519',
                },
            },
        },
    },
    categories: {
        'fpl-vcs': '1249102505531674634',
    },
    roles: {
        divisions: {
            'A': '1247986726060687492',
            'B': '1247986794390229152',
        },
        weightModify: [{ id: '1247210839291990016', multiplier: 2 }],
        'fpl-admin': '1246807125930278952',
        'fpl-pulled': '1249764610739798066',
        'fpl-verified': '1249764674128449567',
    },
    development: {
        enabled: true,
        ephemeral: false,
        guild: process.env.GUILD_ID,
    },
    messageSettings: {
        nsfwMessage: 'The current channel is not a NSFW channel.',
        ownerMessage:
            'The bot developer has the only permissions to use this command.',
        developerMessage: 'You are not authorized to use this command.',
        cooldownMessage:
            "Slow down buddy! You're too fast to use this command ({cooldown}s).", // '{cooldown}' is a variable that shows the time to use the command again (in seconds)
        globalCooldownMessage:
            'Slow down buddy! This command is on a global cooldown ({cooldown}s).', // '{cooldown}' is a variable that shows the time to use the command again (in seconds)
        notHasPermissionMessage:
            'You do not have the permission to use this command.',
        notHasPermissionComponent:
            'You do not have the permission to use this component.',
        missingDevIDsMessage:
            'This is a developer only command, but unable to execute due to missing user IDs in configuration file.',
    },
    divisions: [
        {
            id: 1,
            name: 'Division A',
            shortName: 'A',
        },
        {
            id: 2,
            name: 'Division B',
            shortName: 'B',
        },
    ],
    times: {
        timezones: [
            {
                name: 'EU',
                description: 'Europe',
                tz: 'Europe/Berlin',
            },
            {
                name: 'NA',
                description: 'North America',
                tz: 'EST',
            },
        ],
        /* Cron Time Format: 
        0 0 0 0 0 0
        ┬ ┬ ┬ ┬ ┬ ┬
        │ │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
        │ │ │ │ └───── month (1 - 12)
        │ │ │ └────────── day of month (1 - 31)
        │ │ └─────────────── hour (0 - 23)
        │ └──────────────────── minute (0 - 59)
        └───────────────────────── second (0 - 59, OPTIONAL) */
        checkInTimeOffset: 30, //how long before the match to send the check in message
        checkInEndOffset: 5,
        checkin: [
            {
                division: 'A',
                isEnd: false,
                recurrenceData: {
                    dayOfWeek: 3,
                    hour: 22,
                    minute: 15,
                    tz: 'Europe/Berlin',
                },
            },
        ],
        matches: [
            /*{
                timezone: 'EU',
                division: 'A',
                nr: 1,
                recurrenceData: {
                    dayOfWeek: 3,
                    hour: 22,
                    minute: 45,
                    tz: 'Europe/Berlin',
                },
            },
            {
                timezone: 'EU',
                division: 'A',
                nr: 1,
                recurrenceData: {
                    dayOfWeek: 4,
                    hour: 21,
                    minute: 30,
                    tz: 'Europe/Berlin',
                },
            },
            {
                timezone: 'EU',
                division: 'A',
                nr: 2,
                recurrenceData: {
                    dayOfWeek: 4,
                    hour: 22,
                    minute: 0,
                    tz: 'Europe/Berlin',
                },
            },*/
        ],
    },
};
