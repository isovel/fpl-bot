const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

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

        if (match.status != 2) {
            return interaction.reply({
                content: 'Match has not ended yet.',
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

        const user = await client.users.fetch(userId);

        if (!user) {
            return interaction.reply({
                content: 'User not found.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        //validate the data
        const rewards = client.config.gamemodes.find(
            (gm) => gm.value == gameMode
        )?.rewards;

        if (!rewards) {
            return log('Invalid game mode.', 'error');
        }

        let errorCount = 0;

        interaction.fields.fields.forEach((field) => {
            log(field, 'debug', true);
            let reward = rewards.find((r) => r.name == field.customId);
            if (!reward) {
                return interaction.reply({
                    content: 'Invalid field name.',
                    ephemeral: client.config.development.ephemeral,
                });
            }

            switch (reward.type) {
                case 'select':
                    if (!reward.options.find((o) => o.name == field.value)) {
                        errorCount++;
                        return interaction.reply({
                            content:
                                'Invalid option for field ' +
                                field.customId
                                    .split('-')
                                    .map(
                                        (e) =>
                                            e.charAt(0).toUpperCase() +
                                            e.slice(1)
                                    )
                                    .join(' '),
                            ephemeral: client.config.development.ephemeral,
                        });
                    }
                    break;
                case 'range':
                    if (
                        isNaN(field.value) ||
                        field.value < reward.min ||
                        field.value > reward.max
                    ) {
                        errorCount++;
                        return interaction.reply({
                            content:
                                'Invalid value for field ' +
                                field.customId
                                    .split('-')
                                    .map(
                                        (e) =>
                                            e.charAt(0).toUpperCase() +
                                            e.slice(1)
                                    )
                                    .join(' '),
                            ephemeral: client.config.development.ephemeral,
                        });
                    }
                    break;
                case 'bool':
                    if (
                        field.value.toLowerCase() != 'yes' &&
                        field.value.toLowerCase() != 'no' &&
                        field.value.trim().length > 0
                    ) {
                        errorCount++;
                        return interaction.reply({
                            content:
                                'Invalid value for field ' +
                                field.customId
                                    .split('-')
                                    .map(
                                        (e) =>
                                            e.charAt(0).toUpperCase() +
                                            e.slice(1)
                                    )
                                    .join(' '),
                            ephemeral: client.config.development.ephemeral,
                        });
                    }
                    break;
                default:
                    break;
            }
        });

        if (errorCount > 0) {
            return;
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

        if (
            match.resultData &&
            Object.keys(match.resultData).length == match.users.length
        ) {
            //calculate the points each user gets and update the user data

            Object.keys(match.resultData).forEach(async (userId) => {
                const user = await client.users.fetch(userId);
                const data = match.resultData[userId];

                let points = 0;

                data.forEach((field) => {
                    let reward = rewards.find((r) => r.name == field.name);
                    if (!reward) {
                        return log('Invalid field name.', 'error');
                    }

                    switch (reward.type) {
                        case 'select':
                            points += reward.options.find(
                                (o) => o.name == field.value
                            ).value;
                            break;
                        case 'range':
                            points += field.value * reward.value;
                            break;
                        case 'bool':
                            points +=
                                field.value.toLowerCase() == 'yes'
                                    ? reward.value
                                    : 0;
                            break;
                        default:
                            break;
                    }
                });

                log('Points: ' + points, 'debug');

                const u = await c_users.findOne({
                    discordId: userId,
                });

                if (!u) {
                    log('User not found.', 'warn');
                    return interaction.reply({
                        content: 'User not found.',
                        ephemeral: client.config.development.ephemeral,
                    });
                }

                await c_users.updateOne(
                    {
                        id: userId,
                    },
                    {
                        $inc: {
                            points: points,
                        },
                    }
                );

                user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Match Data Submitted')
                            .setDescription(
                                `Your match data has been analyzed. You have received ${points} points.`
                            )
                            .setColor('Green'),
                    ],
                });
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
        }

        //delete the message
        interaction.message.delete();
        interaction.reply({
            content: 'Match data submitted.',
            ephemeral: client.config.development.ephemeral,
        });
    },
};
