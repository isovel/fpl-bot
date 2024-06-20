const {
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

module.exports = {
    customId: 'enter-match-data',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {*} interaction
     */
    run: async (client, interaction) => {
        const userId = interaction.customId.split('_')[1];
        const division = interaction.customId.split('_')[2];
        const gameMode = interaction.customId.split('_')[3];
        const msgId = interaction.customId.split('_')[4];

        const c_matches = client.runtimeVariables.db.collection('matches');

        const match = await c_matches.findOne({
            division: division,
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

        const user = await client.users.fetch(userId);

        log(user, 'debug', true);

        if (!user) {
            return interaction.reply({
                content: 'User not found.',
                ephemeral: client.config.development.ephemeral,
            });
        }

        const modal = new ModalBuilder()
            .setTitle('Enter Match Data for ' + user.displayName)
            .setCustomId(`submit-match-data_${userId}_${gameMode}_${msgId}`);

        log(gameMode, 'debug');
        client.config.gamemodes
            .find((gm) => {
                {
                    log(gm.value, 'debug');
                    log(gm.value == gameMode, 'debug');
                    return gm.value == gameMode;
                }
            })
            .rewards.forEach((reward) => {
                switch (reward.type) {
                    case 'bool':
                        modal.addComponents(
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setLabel(reward.label)
                                    .setCustomId(reward.name)
                                    .setPlaceholder(reward.description)
                                    .setRequired(false)
                                    .setStyle(TextInputStyle.Short)
                            )
                        );
                        break;
                    default:
                        modal.addComponents(
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setLabel(reward.label)
                                    .setCustomId(reward.name)
                                    .setPlaceholder(reward.description)
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                            )
                        );
                        break;
                }
            });

        interaction.showModal(modal);
    },
};
