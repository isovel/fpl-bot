const { PermissionFlagsBits, ChannelType } = require('discord.js');
const { log } = require('../functions');

let permissionHandlerDivVc = {
    setPulled: async (client, interaction, user, division) => {
        if (user.roles.cache.has(client.config.roles.verified))
            return permissionHandlerDivVc.setVerified(
                client,
                interaction,
                user,
                division
            );
        else
            return permissionHandlerDivVc.setUnverified(
                client,
                interaction,
                user,
                division
            );
    },
    setUnverified: async (client, interaction, user, division) => {
        return new Promise(async (resolve, reject) => {
            //reset verified channel permissions and set unverified channel permissions

            //if user doesnt have pulled role cancel
            if (!user.roles.cache.has(client.config.roles.pulled)) {
                return resolve(false);
            }

            //get vcs
            const vcs = interaction.guild.channels.cache.filter(
                (c) =>
                    c.type === ChannelType.GuildVoice &&
                    c.name.startsWith('Division ' + division)
            );

            log(user.id, 'debug');

            const unverifiedChannel = vcs.find((c) =>
                c.name.trim().endsWith('Unverified')
            );

            const verifiedChannel = vcs.find((c) =>
                c.name.trim().endsWith('Verified')
            );

            log(unverifiedChannel, 'debug');
            log(verifiedChannel, 'debug');

            await unverifiedChannel.permissionOverwrites
                .edit(user.id, {
                    ViewChannel: true,
                    Connect: true,
                    Speak: false,
                })
                .catch((err) => {
                    log(err, 'err');
                    reject(err);
                });

            //if user is connected move him
            if (user.voice.channel) {
                await user.voice.setChannel(unverifiedChannel);
            }

            await verifiedChannel.permissionOverwrites
                .edit(user.id, {
                    ViewChannel: null,
                    Connect: null,
                    Speak: null,
                })
                .catch((err) => {
                    log(err, 'err');
                    reject(err);
                });

            resolve(true);
        });
    },
    setVerified: async (client, interaction, user, division) => {
        return new Promise(async (resolve, reject) => {
            //reset unverified channel permissions and set verified channel permissions

            //if user doesnt have pulled role cancel
            if (!user.roles.cache.has(client.config.roles.pulled)) {
                return resolve(false);
            }

            //get vcs
            const vcs = interaction.guild.channels.cache.filter(
                (c) =>
                    c.type === ChannelType.GuildVoice &&
                    c.name.startsWith('Division ' + division)
            );

            log(user.id, 'debug');

            const unverifiedChannel = vcs.find((c) =>
                c.name.trim().endsWith('Unverified')
            );

            const verifiedChannel = vcs.find((c) =>
                c.name.trim().endsWith('Verified')
            );

            log(verifiedChannel, 'debug');
            log(unverifiedChannel, 'debug');

            await verifiedChannel.permissionOverwrites
                .edit(user.id, {
                    ViewChannel: true,
                    Connect: true,
                    Speak: true,
                })
                .catch((err) => {
                    log(err, 'err');
                    reject(err);
                });

            //if user is connected move him
            if (user.voice.channel) {
                await user.voice.setChannel(verifiedChannel);
            }

            await unverifiedChannel.permissionOverwrites
                .edit(user.id, {
                    ViewChannel: null,
                    Connect: null,
                    Speak: null,
                })
                .catch((err) => {
                    log(err, 'err');
                    reject(err);
                });

            resolve(true);
        });
    },
    reset: async (client, interaction, user, division) => {
        return new Promise(async (resolve, reject) => {
            //reset unverified channel permissions and set verified channel permissions

            //if user doesnt have pulled role cancel
            if (!user.roles.cache.has(client.config.roles.pulled)) {
                return resolve(false);
            }

            //get vcs
            const vcs = interaction.guild.channels.cache.filter(
                (c) =>
                    c.type === ChannelType.GuildVoice &&
                    c.name.startsWith('Division ' + division)
            );

            log(vcs, 'debug');

            const unverifiedChannel = vcs.find((c) =>
                c.name.trim().endsWith('Unverified')
            );

            const verifiedChannel = vcs.find((c) =>
                c.name.trim().endsWith('Verified')
            );

            log(verifiedChannel, 'debug');

            await unverifiedChannel.permissionOverwrites
                .edit(user.id, {
                    ViewChannel: null,
                    Connect: null,
                    Speak: null,
                })
                .catch((err) => {
                    log(err, 'err');
                    reject(err);
                });

            await verifiedChannel.permissionOverwrites
                .edit(user.id, {
                    ViewChannel: null,
                    Connect: null,
                    Speak: null,
                })
                .catch((err) => {
                    log(err, 'err');
                    reject(err);
                });

            resolve(true);
        });
    },
};

module.exports = {
    'div-vc': permissionHandlerDivVc,
};
