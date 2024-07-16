const { EmbedBuilder } = require('discord.js');

module.exports = {
    updateLeaderboard: async (client, division) => {
        //c_leaderboards has a leaderboard for each division. It stores msgId and channelId. If message exists update. Otherwise create new in client.config.channels.leaderboard
        const c_leaderboards =
            client.runtimeVariables.db.collection('leaderboards');
        const c_users = client.runtimeVariables.db.collection('users');

        const leaderboard = await c_leaderboards.findOne({
            division,
        });

        const users = await c_users
            .find({
                division,
            })
            .toArray();

        users.sort((a, b) => (b.points || 0) - (a.points || 0));

        let embedData = [];
        users.forEach((user, index) => {
            if (embedData.length >= 10) return;
            if (!user.points) return;

            //**1. UserName - Score: 100***
            //Kills: 100 | Deaths: 100 | Assists: 100 | KDA: 1.0 | Wins: 100
            let kills = 0;
            let deaths = 0;
            let assists = 0;
            let kda = 0;
            let wins = 0;
            let score = user.points || 0;

            user.matches?.forEach((match) => {
                kills +=
                    match.resultData?.kills || match.playerData?.kills || 0;
                deaths +=
                    match.resultData?.deaths || match.playerData?.deaths || 0;
                assists +=
                    match.resultData?.assists || match.playerData?.assists || 0;
                wins += match.win ? 1 : 0;
            });

            kda = (kills + assists) / (deaths || 1) || 0;

            embedData.push(
                `**${index + 1}. ${
                    user.embarkId.split('#')[0]
                } - Score: ${Math.round(
                    (score / 150) * 1000
                )}**Kills: ${kills} | Deaths: ${deaths} | Assists: ${assists} | KDA: ${kda.toFixed(
                    2
                )} | Wins: ${wins}/${user.matches?.length}`
            );
        });

        if (embedData.length === 0)
            embedData.push('No matches played in this division yet.');

        const leaderboardEmbed = new EmbedBuilder()
            .setTitle(`Division ${division} Leaderboard`)
            .setDescription(embedData.join('\n'))
            .setColor('Green');

        if (leaderboard && leaderboard.channelId && leaderboard.msgId) {
            const channel = await client.channels.fetch(leaderboard.channelId);
            const message = await channel.messages.fetch(leaderboard.msgId);
            message.edit({
                embeds: [leaderboardEmbed],
            });
        } else {
            const channel = await client.channels.fetch(
                client.config.channels.leaderboard
            );
            const message = await channel.send({
                embeds: [leaderboardEmbed],
            });
            await c_leaderboards.updateOne(
                { division },
                {
                    $set: {
                        channelId: channel.id,
                        msgId: message.id,
                    },
                },
                { upsert: true }
            );
        }
    },
};
