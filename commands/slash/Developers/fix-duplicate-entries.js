const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('fix-duplicate-entries')
        .setDescription('Fix duplicate entries in the database.'),
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        const c_users = client.runtimeVariables.db.collection('users');
        const users = await c_users.find().toArray();
        const duplicateUsers = users.filter(
            (user, index, self) =>
                self.findIndex((t) => t.discordId === user.discordId) !== index
        );

        if (duplicateUsers.length === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('No Duplicate Entries')
                        .setDescription(
                            'There are no duplicate entries in the database.'
                        )
                        .setColor('Green'),
                ],
                ephemeral: client.config.development.ephemeral,
            });
        }

        for (const user of duplicateUsers) {
            const userDocs = await c_users
                .find({ discordId: user.discordId })
                .toArray();
            if (userDocs.length > 1) {
                const userDoc = userDocs[0];
                for (let i = 1; i < userDocs.length; i++) {
                    const duplicateUserDoc = userDocs[i];
                    if (
                        userDoc.applicationStatus ===
                        duplicateUserDoc.applicationStatus
                    ) {
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(
                                        'Confirm Duplicate Entry deletion'
                                    )
                                    .setDescription(
                                        `Are you sure you want to delete the duplicate entry for  ?`
                                    )
                                    .setColor('Green'),
                            ],
                            ephemeral: client.config.development.ephemeral,
                        });
                    } else {
                        await c_users.deleteOne({ _id: userDoc._id });
                    }
                }
            }
        }

        log('Duplicate entries have been fixed.', 'info');
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Duplicate Entries Fixed')
                    .setDescription(
                        'Duplicate entries have been fixed in the database.'
                    )
                    .setColor('Green'),
            ],
            ephemeral: client.config.development.ephemeral,
        });
    },
};
