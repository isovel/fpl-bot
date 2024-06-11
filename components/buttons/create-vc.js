const { PermissionFlagsBits, ChannelType } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

module.exports = {
    customId: 'create-vc',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {*} interaction
     */
    run: async (client, interaction) => {
        const users = interaction.customId.split('_').slice(2);
        const division = interaction.customId.split('_')[1];

        log('Creating a VC for division ' + division, 'info');
        log('Users: ' + users.join(', '), 'info');

        //create a vc in client.config.categories['fpl-vcs'] and give every user the right to see it and join it but not to talk
        const category = client.channels.cache.get(
            client.config.categories['fpl-vcs']
        );
        //client.config.roles['fpl-pulled'] client.config.roles['fpl-approved']
        const everyoneRole = interaction.guild.roles.everyone;
        const pulledRole = interaction.guild.roles.cache.get(
            client.config.roles['fpl-pulled']
        );
        const approvedRole = interaction.guild.roles.cache.get(
            client.config.roles['fpl-verified']
        );

        //check if vc already exists

        const existingVC = interaction.guild.channels.cache.find(
            (c) => c.name === 'Division ' + division
        );
        if (existingVC) {
            return interaction.reply({
                content: 'Voice channel already exists!',
                ephemeral: client.config.development.ephemeral,
            });
        }

        const vc = await interaction.guild.channels.create({
            name: 'Division ' + division,
            type: ChannelType.GuildVoice,
            parent: category,
            permissionOverwrites: [
                {
                    id: everyoneRole.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: pulledRole.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                    ],
                    deny: [PermissionFlagsBits.Speak],
                },
                {
                    id: approvedRole.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.Speak,
                    ],
                },
            ],
        });

        interaction.reply({
            content: 'Voice channel created!',
            ephemeral: client.config.development.ephemeral,
        });
    },
};
