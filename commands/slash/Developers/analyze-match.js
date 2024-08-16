import {
  ActionRowBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from 'discord.js'
import OpenAI from 'openai'
import ExtendedClient from '../../../class/ExtendedClient'
import { log } from '../../../functions'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

//analyze a screenshot of a match
export default {
  structure: new SlashCommandBuilder()
    .setName('analyze-match')
    .setDescription('Analyze a screenshot of a match')
    .addAttachmentOption((option) =>
      option
        .setName('screenshot')
        .setDescription('The screenshot of the match')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('prompt')
        .setDescription('The prompt to use')
        .setRequired(false)
    ),
  options: {
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    //let imageUrl = './match.png';
    //let base64Image = fs.readFileSync(imageUrl, { encoding: 'base64' });
    const image = interaction.options.getAttachment('screenshot')
    const prompt = interaction.options.getString('prompt')
    //check if image is a png or jpg
    if (
      !image.contentType.includes('png') &&
      !image.contentType.includes('jpg') &&
      !image.contentType.includes('jpeg')
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Warn')
            .setDescription('The image must be a png or jpg file.')
            .setColor('Yellow'),
        ],
      })
    }
    await interaction.deferReply()
    const imageUrlData = await fetch(image.url)
    const buffer = await imageUrlData.arrayBuffer()
    const stringifiedBuffer = Buffer.from(buffer).toString('base64')
    const contentType = imageUrlData.headers.get('content-type')
    const imageBase64 = `data:${contentType};base64,${stringifiedBuffer}`

    const response = /*await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text:
                                prompt ||
                                `Here is the scoreboard for a video game. Please break it down into text format.\n\nYou will firstly see text either M, L, or H. This indicates the class or role the player played in the match.\n\nTo the right of the class, you will see the player name. The player names are gamertags, so do not correct them; ensure they are accurate.\n\nAfter the player name, there will be an icon, just ignore that.\n\nAfter the icon, the first number you see displayed is the "Eliminations", the second number is the "Assists", the third number is the "Deaths", the fourth number is "Revives", the fifth number is the "Combat Score", the sixth number is the "Support Score", and the final number is the "Objective Score".\n\nWhen viewing the numbers, it's important that you don't mix up this format, so ensure that all numbers are taken extra care of and reported correctly, accurately and aren't modified or changed around.\n\nIf there is a blank row in the screenshot, simply mark the player as "DISCON#0000" and set all their datapoints to 0.\n\nFormat the output as follows:\n Player | Role | E (Eliminations) | A (Assists) | D (Deaths) | R (Revives) | Combat Score | Support | Objective\n\nFinally, respond with only the table in CSV format, separated by commas.`,
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                'url': imageBase64,
                                'detail': 'high',
                            },
                        },
                    ],
                },
            ],
            temperature: 0.7,
        }); */ {
      id: 'chatcmpl-9mnDwvTcNDKcCVWNsa1QqTB9OJ2FY',
      object: 'chat.completion',
      created: 1721415988,
      model: 'gpt-4o-2024-05-13',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content:
              '```csv\nRole,Player,E (Eliminations),A (Assists),D (Deaths),R (Revives),Combat Score,Support,Objective\nH,YANNLECUN#8653,8,2,5,2,3,618,917,2,200\nL,FLIPPRR#4688,6,7,3,2,4,416,701,200\nM,EVIL_LAUGHTER#9249,2,8,6,4,2,686,7,583,700\nL,ULTIMATE3VIL619#4817,2,1,7,3,2,945,780,400\nL,BENIS#1599,5,0,7,4,4,310,1,165,1,500\nH,PRM_LOTUS#6328,4,4,2,1,3,744,908,2,500\nL,SKUL#7469,8,1,3,2,4,207,670,2,700\nL,LNK#0602,5,5,4,0,5,859,300,300\nM,LYRASPAWN#0901,3,1,3,1,1,369,541,200\nL,PRM_TOTEM#9875,3,0,4,2,2,642,430,1,500\nM,THIXXYBODYPILLOW#1719,5,1,5,3,3,735,805,0\nL,COOKIE#1600,3,1,8,0,2,732,0,500\n```',
          },
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 1738,
        completion_tokens: 360,
        total_tokens: 2098,
      },
      system_fingerprint: 'fp_5e997b69d8',
    }

    log(response, 'debug')

    let csvRawData = response.choices[0].message.content
      .replace('```csv', '')
      .replaceAll('`', '')
      .replaceAll('|', ',')
      .replaceAll(' ', '')

    log(csvRawData, 'debug')

    let playerData = new Map()

    //parse csv data
    let lines = csvRawData.split('\n')
    //remove all empty
    lines = lines.filter((line) => line.trim() != '')
    lines.forEach((line, index) => {
      if (index == 0) return
      if (line.trim() == '') return
      if (line.trim().toLowerCase().startsWith('discon#0000')) return
      playerData.set(line.split(',')[0], line.split(',').slice(1))
    })

    log(playerData, 'debug', true)

    //key is name of player, value is object of stats
    let keyValuePlayerData = {}

    playerData.forEach((value, key) => {
      keyValuePlayerData[key.toLowerCase()] = {
        teamName: value[0],
        teamPosition: parseInt(value[1]),
        teamCash: parseInt(value[2]),
        role: value[3],
        eliminations: parseInt(value[4]),
        assists: parseInt(value[5]),
        deaths: parseInt(value[6]),
        revives: parseInt(value[7]),
        combat: parseInt(value[8]),
        support: parseInt(value[9]),
        objective: parseInt(value[10]),
      }
    })

    //save data in c_matcheAnalysis
    const c_matchAnalysis =
      client.runtimeVariables.db.collection('matchAnalysis')
    const timestamp = Date.now()
    c_matchAnalysis.insertOne({
      timestamp: new Date(timestamp),
      playerData: keyValuePlayerData,
      csvData: csvRawData,
      gptResponse: response,
      imageUrl: image.url,
    })

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Match Data')
          .setFields(
            Array.from(playerData).map(([key, value]) => {
              return {
                name: key,
                value: value.join(' | '),
                inline: false,
              }
            })
          )
          .setColor('Purple'),
      ],
      files: [
        new AttachmentBuilder()
          .setName(timestamp + '.png')
          .setFile(Buffer.from(stringifiedBuffer, 'base64'), timestamp),
      ],
    })
    interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Gamemode Selection')
          .setDescription(
            'Please enter the gamemode of the match. This will be used to calculate the points for the match.'
          )
          .setColor('Purple'),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`match-gamemode_${timestamp}`)
            .setPlaceholder('Select the Gamemode')
            .addOptions(
              client.config.gamemodes.map((gm) => ({
                label: gm.label,
                value: gm.value,
              }))
            )
        ),
      ],
    })
  },
}
