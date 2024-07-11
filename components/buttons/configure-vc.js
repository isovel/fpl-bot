const { PermissionFlagsBits, ChannelType } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { log } = require('../../functions');

/*
There are 4 voice channels
- Division A Unverified (Joinabl only by FPL DIV: A && FPL Chosen && !FPL Verified)
- Division A Verified (Joinable only by FPL DIV: A && FPL Chosen && FPL Verified)
- Division B Unverified (Joinable only by FPL DIV: B && FPL Chosen && !FPL Verified)
- Division B Verified (Joinable only by FPL DIV: B && FPL Chosen && FPL Verified)


*/

module.exports = {
    customId: 'configure-vc',
    options: {
        developers: true,
    },
    /**
     *
     * @param {ExtendedClient} client
     * @param {*} interaction
     */
    run: async (client, interaction) => {
        const division = interaction.customId.split('_')[1];

        log('Creating a VC for division ' + division, 'info');

        const c_queues = client.runtimeVariables.db.collection('queues');

        let queueData = await c_queues.findOne({
            division: division,
        });

        if (!queueData?.randomUsers?.length) {
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

        const users = queueData.randomUsers.map((u) => u.id);

        log('Users: ' + users.join(', '), 'info');

        //create a vc in client.config.categories['fpl-vcs'] and give every user the right to see it and join it but not to talk
        const category = client.channels.cache.get(
            client.config.categories['fpl-vcs']
        );
        //client.config.roles.pulled client.config.roles['fpl-approved']
        const everyoneRole = interaction.guild.roles.everyone;
        const approvedRole = interaction.guild.roles.cache.get(
            client.config.roles.verified
        );

        //delete old channel if there
        const oldChannels = interaction.guild.channels.cache.filter(
            (c) =>
                c.type === ChannelType.GuildVoice &&
                c.name.startsWith(`Division ${division}`)
        );
        oldChannels?.map((c) => c.delete());

        let UnverifiedPermissionData = [];
        let VerifiedPermissionData = [];
        await users.forEach(async (userId) => {
            let tUser = await interaction.guild.members.fetch(userId);
            log(tUser, 'debug', true);
            log('Creating VC for ' + tUser.id, 'debug');
            //if user doesnt have approved role, dont give them the right to join the vc
            if (!tUser.roles.cache.has(approvedRole.id)) {
                UnverifiedPermissionData.push({
                    id: tUser.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                    ],
                    deny: [PermissionFlagsBits.Speak],
                });
            } else {
                VerifiedPermissionData.push({
                    id: tUser.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.Speak,
                    ],
                });
            }
        });

        log(UnverifiedPermissionData, 'debug', true);

        //create new unverified channel
        const unverifiedChannel = await interaction.guild.channels.create({
            name: `Division ${division} Unverified`,
            type: ChannelType.GuildVoice,
            parent: category,
            permissionOverwrites: [
                {
                    id: everyoneRole.id,
                    deny: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.Speak,
                    ],
                },
                ...UnverifiedPermissionData,
            ],
        });

        log('Unverified channel created', 'info');

        //create new verified channel and save it in the db
        const verifiedChannel = await interaction.guild.channels.create({
            name: `Division ${division} Verified`,
            type: ChannelType.GuildVoice,
            parent: category,
            permissionOverwrites: [
                {
                    id: everyoneRole.id,
                    deny: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.Speak,
                    ],
                },
                ...VerifiedPermissionData,
            ],
        });

        log('Verified channel created', 'info');

        //save the channels in the db
        const c_config = client.runtimeVariables.db.collection('config');

        //upsert
        c_config
            .updateOne(
                { category: 'channels' },
                {
                    $set: {
                        voice: {
                            [`div-${division}`]: {
                                unverified: unverifiedChannel.id,
                                verified: verifiedChannel.id,
                            },
                        },
                    },
                },
                { upsert: true }
            )
            .then(() => {
                interaction.reply({
                    content: 'Vcs created!',
                    ephemeral: client.config.development.ephemeral,
                });
            })
            .catch((err) => {
                log(err, 'err');
                interaction.reply({
                    content: 'An error occurred creating the VCs.',
                    ephemeral: client.config.development.ephemeral,
                });
            });
    },
};
