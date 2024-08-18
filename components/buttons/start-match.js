import { EmbedBuilder } from 'discord.js'
import ExtendedClient from '../../class/ExtendedClient.js'

export default {
  customId: 'start-match',
  options: {
    developers: true,
  },
  /**
   *
   * @param {ExtendedClient} client
   * @param {*} interaction
   */
  run: async (client, interaction) => {
    const division = interaction.customId.split('_')[1]

    const c_matches = client.runtimeVariables.db.collection('matches')

    const match = await c_matches.findOne({
      division: division,
      msgId: interaction.message.id,
    })

    if (!match) {
      return interaction.reply({
        content: 'Match code not set.',
        ephemeral: client.config.development.ephemeral,
      })
    }

    if (match.status == 1) {
      return interaction.reply({
        content: 'Match already started.',
        ephemeral: client.config.development.ephemeral,
      })
    }

    //send dm to every pulled user
    //if (!client.config.development.enabled)

    // await users.forEach((user) => {
    //   client.users.fetch(user.id).then((u) => {
    //     if (!u)
    //       return interaction.reply({
    //         content: "User not found.",
    //         ephemeral: client.config.development.ephemeral,
    //       });

    //     //if user doesnt have verified role
    //     if (!u.roles?.cache?.has(client.config.roles.verified)) {
    //       return interaction.reply({
    //         embeds: [
    //           new EmbedBuilder()
    //             .setTitle("Error")
    //             .setColor("Red")
    //             .setDescription(`${u.displayName} is not yet verified.`),
    //         ],
    //         ephemeral: client.config.development.ephemeral,
    //       });
    //     }
    //     u.send({
    //       embeds: [
    //         new EmbedBuilder()
    //           .setTitle("Match")
    //           .setDescription(
    //             `The match code for the match in division ${division} is **${match.matchCode}**`
    //           )
    //           .setColor("Green"),
    //       ],
    //     });
    //   });
    // });

    c_matches.updateOne(
      {
        division: division,
        msgId: interaction.message.id,
      },
      {
        $set: {
          status: 1,
        },
      }
    )

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Match')
          .setDescription('Match started.')
          .setColor('Green'),
      ],
      ephemeral: client.config.development.ephemeral,
    })
  },
}
