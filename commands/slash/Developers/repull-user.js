const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
} = require('discord.js');
const permHandler = require('../../../handlers/permissions')['div-vc'];
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('repull-user')
        .setDescription('Repull a specific user.')
        .addUserOption((opt) =>
            opt.setName('user').setDescription('The user.').setRequired(true)
        ),
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        const user = interaction.options.getMember('user');

        const c_users = client.runtimeVariables.db.collection('users');

        const userData = await c_users.findOne({ discordId: user.id });

        const c_queues = client.runtimeVariables.db.collection('queues');

        let queueData = await c_queues.findOne({
            division: userData.division,
        });

        if (!queueData) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('Queue not found in the database.')
                        .setColor('Red'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        //check if there are more random users than pulled users
        if (queueData.users.length <= queueData.randomUsers.length) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Warning')
                        .setDescription(
                            `There are no more users to repull. Queue length: ${queueData.users.length}, Pulled users length: ${queueData.randomUsers.length}`
                        )
                        .setColor('Yellow'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        if (
            !(queueData.randomUsers.filter((u) => u.id === user.id).length > 0)
        ) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Warning')
                        .setDescription('User not found in the queue.')
                        .setColor('Yellow'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        //remove pulled role from user
        user.roles.remove(
            interaction.guild.roles.cache.get(client.config.roles['fpl-pulled'])
        );

        //Remove permissions from user to access vc if exists
        permHandler.reset(client, interaction, user, userData.division);

        //pull new random user from queue.users
        let randomUser;
        while (!randomUser) {
            randomUser =
                queueData.users[
                    Math.floor(Math.random() * queueData.users.length)
                ];
            if (
                queueData.randomUsers.filter((u) => u.id === randomUser.id)
                    .length > 0
            ) {
                randomUser = null;
            }
        }

        queueData.randomUsers.push(randomUser);

        //add pulled role to random user
        let pulledUser = await interaction.guild.members.fetch(randomUser.id);
        pulledUser.roles.add(
            interaction.guild.roles.cache.get(client.config.roles['fpl-pulled'])
        );
        //set permissions for random user
        permHandler.setPulled(
            client,
            interaction,
            pulledUser,
            userData.division
        );

        const c_matches = client.runtimeVariables.db.collection('matches');

        log('MSGID: ' + queueData.pulledMsgId, 'debug');

        const match = await c_matches.findOne({
            division: userData.division,
            msgId: queueData.pulledMsgId,
        });

        log('MATCH: ' + match, 'debug');

        if (match && match.matchCode && match.status == 1) {
            //send dm
            pulledUser.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Match')
                        .setDescription(
                            `The match code for the match in division ${userData.division} is **${match.matchCode}**`
                        )
                        .setColor('Green'),
                ],
            });
        }

        await c_queues
            .updateOne(
                { division: userData.division },
                {
                    $addToSet: { randomUsers: randomUser },
                    $pull: { randomUsers: { id: user.id } },
                }
            )
            .catch((err) => {
                log(err, 'err');
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription(
                                'An error occurred while writing to the database.'
                            )
                            .setColor('Red'),
                    ],
                    ephemeral: client.config.development.ephemeral,
                });
            });
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success')
                    .setDescription(
                        `User ${user.displayName} has been repulled to ${pulledUser.displayName}.`
                    )
                    .setColor('Green'),
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            'configure-web-server_' + userData.division
                        )
                        .setLabel('Configure Web Server')
                        .setStyle('Primary')
                ),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
