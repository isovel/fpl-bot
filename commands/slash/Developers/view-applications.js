const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
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
    run: async (client, interaction, replied) => {
        const c_users = client.runtimeVariables.db.collection('users');
        let skipIds = client.runtimeVariables.applicationSkips || [];
        let users;
        try {
            users = await c_users
                .find({
                    applicationStatus: 1,
                    discordId: { $nin: skipIds },
                })
                .toArray();
        } catch (error) {
            log(error, 'err');
            return interaction.reply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            'An error occurred while fetching the applications.'
                        )
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (users.length === 0) {
            if (skipIds.length > 0) {
                return interaction.update({
                    components: [],
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('No More Applications')
                            .setDescription(
                                'There are no more pending applications.'
                            )
                            .setColor('Purple'),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            }
            return interaction.reply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle('No Applications')
                        .setDescription('There are no pending applications.')
                        .setColor('Purple'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        let user = users[0];
        let member;
        //show first application and append a grayed out previous button, a decline button, an accept button and a next button (use an embed to show the user's application)
        try {
            member = await interaction.guild.members.fetch(user.discordId);
        } catch (error) {
            log(error, 'err');
            //await c_users.deleteOne({ discordId: user.discordId });
            client.runtimeVariables.applicationSkips.push(user.discordId);
            interaction.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            'A user created an application and left. Do you want to delete his entrie in the db?'
                        )
                        .setColor('Red'),
                ],
                components: [
                    new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`delete-application_${user._id}`)
                            .setPlaceholder('Action')
                            .addOptions(
                                {
                                    label: 'Yes',
                                    value: 'yes',
                                },
                                {
                                    label: 'No',
                                    value: 'no',
                                }
                            )
                    ),
                ],
            });
            //run the command again
            return module.exports.run(client, interaction, replied);
        }

        let seasonTranslate = {
            cb1: 'Closed Beta 1',
            cb2: 'Closed Beta 2',
            ob1: 'Open Beta',
            ob: 'Open Beta',
            s1: 'Season 1',
            s2: 'Season 2',
            s3: 'Season 3',
        };

        let embedData = [
            `**Embark ID:** ${user.embarkId}`,
            `**Last Recorded Rank:** ${user.lastRecordedRank}`,
            `**Highest Recorded Rank:** ${user.highestRecordedRank}`,
            `**Seasons Played:** ${user.seasonsPlayed
                .split(',')
                .map((season) => seasonTranslate[season]?.toLowerCase())
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
            .setTitle(`**${member.user.displayName}**'s Application`)
            .setThumbnail(member.displayAvatarURL())
            .setDescription(embedData.join('\n'))
            .setColor('Purple');

        let divisionOptions = client.config.divisions.map((division) => ({
            label: `Accept into ${division.name}`,
            value: division.shortName,
        }));

        let viewApplicationMessage = {
            content: '',
            embeds: [embed],
            components: [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`application-action_${user.discordId}`)
                        .setPlaceholder('Action')
                        .addOptions(
                            {
                                label: 'Skip',
                                value: 'skip',
                            },
                            ...divisionOptions,
                            {
                                label: 'Decline',
                                value: 'decline',
                            }
                        )
                ),
            ],
            ephemeral: client.config.development.ephemeral,
        };

        if (replied) interaction.update(viewApplicationMessage);
        else interaction.reply(viewApplicationMessage);
    },
};
