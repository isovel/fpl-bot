const OpenAI = require('openai');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
        ),
    run: async (client, interaction) => {
        //let imageUrl = './match.png';
        //let base64Image = fs.readFileSync(imageUrl, { encoding: 'base64' });
        const image = interaction.options.getAttachment('screenshot');
        //check if image is a png or jpg
        console.log(image);
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
        interaction.deferReply();
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
                            text: `Here is the scoreboard for a video-game, please can you help me break it down into text format. The scoreboard is split into 4 teams, and you'll see a number on the left, 1,2,3 and 4. Within each team is three rows matching the players name and their stats to the right. You will also see text to the left of the player name either M, L or H that is the class or role the player played in the match. Then in small text above the team names, you will see E, A, D, R, Combat, Support and Objective. E means Eliminations, A means Assists, D means Deaths and R means Revives. The player has a hastag and 4 numbers after his name, add that to the data as well. Output cash as only a number. Can you make the output in the following format; player | teamName | teamPosition | teamCash | role | eliminations | assists | deaths | revives | combat | support | objective. Respond with only the table as a csv (seperated by comma).`,
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
        });

        let csvRawData = response.choices[0].message.content
            .replaceAll('`', '')
            .replaceAll('|', ',')
            .replaceAll(' ', '');

        let playerData = new Map();

        //parse csv data
        let lines = csvRawData.split('\n');
        lines.forEach((line, index) => {
            if (index == 0) return;
            if (line.trim() == '') return;
            playerData.set(line.split(',')[0], line.split(',').slice(1));
        });

        log(playerData, 'debug');

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
        });
    },
};
