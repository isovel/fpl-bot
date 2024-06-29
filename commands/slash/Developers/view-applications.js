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
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction, skipIds = []) => {
        const c_users = client.runtimeVariables.db.collection('users');
        let users;
        try {
            users = await c_users
                .find({
                    applicationStatus: 1,
                    discordId: { $nin: skipIds },
                })
                .toArray();

            console.dir(users);
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
        log(user, 'debug');
        //show first application and append a grayed out previous button, a decline button, an accept button and a next button (use an embed to show the user's application)
        let member = interaction.guild.members.cache.get(user.discordId);
        if (!member) {
            member = await interaction.guild.members.fetch(user.discordId);
            log(member, 'debug');
            if (!member) {
                //delete user from database
                await c_users.deleteOne({ discordId: user.discordId });
                interaction.channel.send(
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            'A user who create an application and left the server has been removed from the database.'
                        )
                        .setColor('Red')
                );
                //run the command again
                return module.exports.run(client, interaction, skipIds);
            }
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

        log(embedData, 'debug');

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
                        .setCustomId(
                            `application-action_${
                                user.discordId
                            }_${skipIds.join(',')}`
                        )
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

        if (skipIds.length > 0) interaction.update(viewApplicationMessage);
        else await interaction.reply(viewApplicationMessage);
    },
};
