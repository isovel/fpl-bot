const OpenAI = require('openai');
const {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    AttachmentBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const { log } = require('../../../functions');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

//analyze a screenshot of a match
module.exports = {
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
        const image = interaction.options.getAttachment('screenshot');
        const prompt = interaction.options.getString('prompt');
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
            });
        }
        await interaction.deferReply();
        const imageUrlData = await fetch(image.url);
        const buffer = await imageUrlData.arrayBuffer();
        const stringifiedBuffer = Buffer.from(buffer).toString('base64');
        const contentType = imageUrlData.headers.get('content-type');
        const imageBase64 = `data:${contentType};base64,${stringifiedBuffer}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text:
                                prompt ||
                                `Here is the scoreboard for a video-game, please can you help me break it down into text format. The scoreboard is split into 2-4 teams, and you'll see a number on the left, 1,2,3 and 4. Within each team is three rows matching the players name and their stats to the right. You will also see text to the left of the player name either M, L or H that is the class or role the player played in the match. Then in small text above the team names, you will see E, A, D, R, Combat, Support and Objective. E means Eliminations, A means Assists, D means Deaths and R means Revives. The player has a hastag and 4 numbers after his name, add that to the data as well. Output the full player identification string exactly as written, dont remove any letters or numbers at any point (also do not remove numbers before the hashtag) and dont add anything. The player identification string can include all latin letters at any point. Output cash as only a number. Can you make the output in the following format; player | teamName | teamPosition | teamCash | role | eliminations | assists | deaths | revives | combat | support | objective. Respond with only the table as a csv (seperated by comma).`,
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
            temperature: 0,
        }); /* {
            id: 'chatcmpl-9lM9zuWc55oCHX6koFeuW6lARgSv7',
            object: 'chat.completion',
            created: 1721073627,
            model: 'gpt-4o-2024-05-13',
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content:
                            'player,teamName,teamPosition,teamCash,role,eliminations,assists,deaths,revives,combat,support,objective\nSTEMON #5456,The Vogues,1,36090,H,8,0,4,0,5575,2933,2900\nOBEMUS #8871,The Vogues,1,36090,H,0,3,6,0,1093,2137,400\nTEEJAY #0768,The Vogues,1,36090,M,0,3,4,4,1929,4077,900\nVOIRI #1076,The Shock & Awe,2,13440,M,4,6,5,1,3805,2627,300\nWITTYTRAP #7545,The Shock & Awe,2,13440,H,6,3,4,0,4436,3885,1200\nIK_RIBSTARTTV #0410,The Shock & Awe,2,13440,L,11,3,2,1,6850,400,1700\nGEORGY #3016,The High Notes,3,11640,M,4,5,2,3,2823,4751,200\nCYNLO #5113,The High Notes,3,11640,H,4,4,5,0,3373,292,1200\nANIMEMIES #6342,The High Notes,3,11640,M,3,5,4,3,3576,3412,1700\nHEJZ #1913,The Mighty,4,1952,H,0,0,1,0,0,0,0\nCOOLJWB #1524,The Mighty,4,1952,L,0,0,5,0,3807,150,1000\nAMARKINE #4523,The Mighty,4,1952,L,0,1,4,1,1358,250,0',
                    },
                    logprobs: null,
                    finish_reason: 'stop',
                },
            ],
            usage: {
                prompt_tokens: 1678,
                completion_tokens: 430,
                total_tokens: 2108,
            },
            system_fingerprint: 'fp_298125635f',
        };*/

        log(response, 'debug');

        let csvRawData = response.choices[0].message.content
            .replace('```csv', '')
            .replaceAll('`', '')
            .replaceAll('|', ',')
            .replaceAll(' ', '');

        log(csvRawData, 'debug');

        let playerData = new Map();

        //parse csv data
        let lines = csvRawData.split('\n');
        //remove all empty
        lines = lines.filter((line) => line.trim() != '');
        lines.forEach((line, index) => {
            if (index == 0) return;
            if (line.trim() == '') return;
            if (line.trim().toLowerCaswe().startsWith('discon#0000')) return;
            playerData.set(line.split(',')[0], line.split(',').slice(1));
        });

        log(playerData, 'debug', true);

        //key is name of player, value is object of stats
        let keyValuePlayerData = {};

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
            };
        });

        //save data in c_matcheAnalysis
        const c_matchAnalysis =
            client.runtimeVariables.db.collection('matchAnalysis');
        const timestamp = Date.now();
        c_matchAnalysis.insertOne({
            timestamp: new Date(timestamp),
            playerData: keyValuePlayerData,
            csvData: csvRawData,
            gptResponse: response,
            imageUrl: image.url,
        });

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
                            };
                        })
                    )
                    .setColor('Purple'),
            ],
            files: [
                new AttachmentBuilder()
                    .setName(timestamp + '.png')
                    .setFile(
                        Buffer.from(stringifiedBuffer, 'base64'),
                        timestamp
                    ),
            ],
        });
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
        });
    },
};
