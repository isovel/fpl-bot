const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ButtonBuilder,
    EmbedFooterOptions,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('view-applications')
        .setDescription('View all pending applications.'),
    options: {
        developers: true,
    },
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const c_users = client.runtimeVariables.db.collection('users');
        let users;
        try {
            users = await c_users
                .find({
                    applicationStatus: 1,
                })
                .toArray();

            console.dir(users);
        } catch (error) {
            log(error, 'err');
            return interaction.reply({
                content: 'An error occurred while fetching the applications.',
                ephemeral: true,
            });
        }

        if (users.length === 0) {
            return interaction.reply({
                content: 'There are no pending applications.',
                ephemeral: true,
            });
        }

        let user = users[0];
        //show first application and append a grayed out previous button, a decline button, an accept button and a next button (use an embed to show the user's application)
        let member = interaction.guild.members.cache.get(user.discordId);
        if (!member) {
            member = await interaction.guild.members.fetch(user.discordId);
        }

        /*
"platform": "PC",
  "lastRecordedRank": "Diamond",
  "highestRecordedRank": "Diamond-CB2",
  "seasonsPlayed": "cb1",
  "playtime": 200,
  "wins": 111,
  "losses": 111,
  "eliminations": 111,
  "deaths": 111,
  "isMember": false,
  "kd": "1.00",
  "matchesPlayed": 222,
  "winrate": "50.00",
  "createdAt": {
    "$date": "2024-06-03T19:01:54.380Z"
  }
*/

        let seasonTranslate = {
            cb1: 'Closed Beta 1',
            cb2: 'Closed Beta 2',
            ob1: 'Open Beta 1',
            s1: 'Season 1',
            s2: 'Season 2',
        };

        let embedData = [
            `**Embark ID:** ${user.embarkId}`,
            `**Last Recorded Rank:** ${user.lastRecordedRank}`,
            `**Highest Recorded Rank:** ${
                user.highestRecordedRank.split('-')[0]
            } ${seasonTranslate[user.highestRecordedRank.split('-')[1]]}`,
            `**Seasons Played:** ${user.seasonsPlayed
                .split(',')
                .map((season) => seasonTranslate[season])
                .join(', ')}`,
            `**Platform:** ${user.platform}`,
            `**Playtime:** ${user.playtime} hours`,
            `**Wins:** ${user.wins}`,
            `**Losses:** ${user.losses}`,
            `**Eliminations:** ${user.eliminations}`,
            `**Deaths:** ${user.deaths}`,
            `**Matches Played:** ${user.matchesPlayed}`,
            `**KD:** ${user.kd}`,
            `**Winrate:** ${user.winrate}%`,
        ];

        let embed = new EmbedBuilder()
            .setTitle(
                'Application - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'
            )
            .setThumbnail(member.displayAvatarURL())
            .setDescription(embedData.join('\n'))
            .setColor('Blurple');

        await interaction.reply({
            embeds: [embed],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('view-applications-previous')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('view-applications-decline')
                        .setLabel('Decline')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('view-applications-accept_a')
                        .setLabel('Accept Division A')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('view-applications-accept_b')
                        .setLabel('Accept Division B')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('view-applications-next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(users.length === 1 ? true : false)
                ),
            ],
        });
    },
};
