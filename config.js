export default {
  client: {
    token: process.env.DISCORD_TOKEN,
    id: process.env.DISCORD_CLIENT_ID,
  },
  db: {
    name: 'FFL-Bot',
  },
  handler: {
    prefix: 'fpl_',
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
    ownerId: '255515821541949440', // isotach
    developers: [
      '255515821541949440', // isotach
    ],
  },
  seasons: [
    {
      name: 'Alpha',
      value: 'alpha',
    },
    {
      name: 'Closed Beta 1',
      value: 'cb1',
    },
    {
      name: 'Closed Beta 2',
      value: 'cb2',
    },
    {
      name: 'Open Beta 1',
      value: 'ob1',
    },
    {
      name: 'Season 1',
      value: 's1',
    },
    {
      name: 'Season 2',
      value: 's2',
    },
    {
      name: 'Season 3',
      value: 's3',
    },
  ],
  gamemodes: [
    {
      label: 'CASHOUT',
      value: 'cashout',
      teams: 4,
      winningTeams: [1],
    },
    {
      label: 'TERMINAL ATTACK',
      value: 'terminal-attack',
      teams: 2,
      winningTeams: [1],
    },
    {
      label: 'POWER SHIFT',
      value: 'power-shift',
      teams: 2,
      winningTeams: [1],
    },
    {
      label: 'QUICK CASH',
      value: 'quick-cash',
      teams: 3,
      winningTeams: [1],
    },
    {
      label: 'BANK IT',
      value: 'bank-it',
      teams: 4,
      winningTeams: [1],
    },
  ],

  channels: {
    modLogs: {
      enabled: false,
      channel: '1246810115479310427',
    },
    queue: '1254462088148029541',
    voice: {
      divisions: {
        verified: {
          A: '1249766792763543637',
          B: '1250118891666018314',
        },
        unverified: {
          A: '1250130019448127519',
        },
      },
    },
    leaderboard: '1247568563187748970',
    notifications: {
      application: '1260564188410150922',
      match: '1261038899547865088',
      division: '1261433355124080700',
    },
  },
  categories: {
    'fpl-vcs': '1249102505531674634',
  },
  roles: {
    divisions: {
      A: '1247986726060687492',
      B: '1247986794390229152',
    },
    //multipliers will be added to the user's weight (weight+=multiplier-1)
    weightModify: [
      {
        id: '1247210839291990016',
        multiplier: 2,
        name: 'YouTube Member',
      },
      {
        id: '1258553710070468651',
        multiplier: 1000,
        name: 'Guaranteed Pick',
      },
    ],
    admin: '1246807125930278952',
    pulled: '1249764610739798066',
    verified: '1249764674128449567',
    pending: '1256331958041186388',
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
  streaming: {
    youtube: {
      channelId: 'UCMJy5yBQq-RhcCnh20W9xzQ',
    },
    twitch: {
      channelId: 'THiiXY',
    },
  },
  development: {
    enabled: true,
    ephemeral: false,
    deployToGuild: true,
    logFile: 'bot.log',
    guild: process.env.GUILD_ID,
  },
  messageSettings: {
    nsfwMessage: 'The current channel is not set as age-restricted.',
    ownerMessage: 'You do not have permission to use this command.',
    developerMessageCommand: 'You do not have permission to use this command.',
    developerMessageComponent:
      'You do not have permission to use this component.',
    cooldownMessage:
      'Slow down buddy! This command is currently on cooldown ({cooldown}s).', // '{cooldown}' is a variable that shows the time to use the command again (in seconds)
    globalCooldownMessage:
      'Slow down buddy! This command is currently on global cooldown ({cooldown}s).', // '{cooldown}' is a variable that shows the time to use the command again (in seconds)
    notHasPermissionMessage: 'You do not have permission to use this command.',
    notHasPermissionComponent:
      'You do not have permission to use this component.',
    missingDevIDsMessage:
      'Unable to execute command due to missing user IDs in configuration file.',
  },
}
