import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'
import config from '../../../configurations.js'
import { log } from '../../../functions.js'

export default {
  structure: new SlashCommandBuilder()
    .setName('open-queue')
    .setDescription('Open the queue for a specific division')
    .addStringOption((opt) =>
      opt
        .setName('division')
        .setDescription('The division to open the queue for.')
        .setRequired(true)
        .addChoices(
          config.divisions.map((d) => {
            return { name: d.shortName, value: d.shortName }
          })
        )
    ),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    const division = interaction.options.getString('division')

    log(`Opening queue for division ${division}`, 'info')

    let c_queues = client.runtimeVariables.db.collection('queues')

    //upsert queue in db for division
    c_queues
      .updateOne(
        { division: division },
        {
          $set: {
            open: true,
          },
        },
        { upsert: true }
      )
      .then(async (result) => {
        log(result, 'debug')
        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Warning')
                .setDescription(
                  `Queue for division ${division} is already open.`
                )
                .setColor('Yellow'),
            ],
            ephemeral: client.config.development.ephemeral,
          })
        }

        log(result, 'debug')

        //send message
        let embed = new EmbedBuilder()
          .setTitle('Check In Division ' + division)
          .setDescription(
            `Check in for Division ${division} is now open. \nPress the Button to enter or leave the Queue.` // \n||<@&${client.config.roles.divisions[division]}>||`
          )
          .setColor('Purple')
        let msg = await client.channels.cache
          .get(client.config.channels.queue)
          .send({
            embeds: [embed],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`checkin_${division}`)
                  .setLabel('Check In')
                  .setStyle('Primary'),
                new ButtonBuilder()
                  .setCustomId(`checkout_${division}`)
                  .setLabel('Check Out')
                  .setStyle('Primary')
              ),
            ],
          })

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Success')
              .setDescription(`Queue for division ${division} has been opened.`)
              .setColor('Green'),
          ],
          ephemeral: client.config.development.ephemeral,
        })
        //write msg channel to db
        c_queues.updateOne({ division: division }, { $set: { msgId: msg.id } })
      })
      .catch((err) => {
        log(err, 'err')
        interaction.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('Error')
              .setDescription('An error occurred while opening the queue.')
              .setColor('Red'),
          ],
          ephemeral: client.config.development.ephemeral,
        })
      })
  },
}
