const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const { log } = require('../../../functions');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('update-weight')
        .setDescription('Update your weight.'),
    run: async (client, interaction) => {
        const user = interaction.member;

        //check if user has an application
        const c_users = client.runtimeVariables.db.collection('users');
        const userDoc = await c_users.findOne({
            discordId: user.id,
        });

        if (!userDoc) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('User not found in the database.')
                        .setColor('Red'),
                ],
                ephemeral: true,
            });
        }

        let weight = 1;
        let specialRoles = [];
        client.config.roles.weightModify.forEach((role) => {
            if (user.roles.cache.has(role.id)) {
                log(`User has role ${role.name}`, 'debug');
                weight += role.multiplier - 1;
                specialRoles.push(role.name);
            }
        });

        log(`User weight: ${weight}`, 'debug');

        if (userDoc.weight == weight) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Warning')
                        .setDescription('Your weight is already up to date.')
                        .setColor('Yellow'),
                ],
                ephemeral: true,
            });
        }

        await c_users.updateOne(
            { discordId: user.id },
            {
                $set: {
                    weight: weight,
                    defaultWeight: weight,
                    specialRoles: specialRoles,
                },
            }
        );

        const c_queues = client.runtimeVariables.db.collection('queues');

        let queueData = await c_queues.findOne({
            division: userDoc.division,
        });

        if (queueData.open && queueData.users.find((u) => u.id === user.id)) {
            //update queue
            await c_queues.updateOne(
                {
                    division: userDoc.division,
                },
                {
                    $set: {
                        'users.$[elem].weight': weight,
                    },
                },
                {
                    arrayFilters: [{ 'elem.id': user.id }],
                }
            );
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Weight Updated')
                    .setDescription(
                        `Your weight has been updated to **${weight}**.`
                    )
                    .setColor('Green'),
            ],
            ephemeral: true,
        });
    },
};
