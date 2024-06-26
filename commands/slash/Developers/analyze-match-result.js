const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { log } = require('../../../functions');
const { createWorker } = require('tesseract.js');
const sharp = require('sharp');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('analyze-match-result')
        .setDescription('Analyze a screenshot of the match result!')
        .addAttachmentOption((opt) =>
            opt
                .setName('screenshot')
                .setDescription('The screenshot of the match result.')
                .setRequired(true)
        ),
    options: {
        developers: true,
    },
    run: async (client, interaction) => {
        //check if screenshot is jpg/png
        const imageAtachment = interaction.options.getAttachment('screenshot');

        if (!['image/jpeg', 'image/png'].includes(imageAtachment.contentType)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(
                            'The provided file is not a jpg or png image.'
                        )
                        .setColor('Red'),
                ],
                ephemeral: true,
            });
        }

        interaction.deferReply();

        const imageArrayBuffer = await fetch(imageAtachment.url);

        //cut
        const image = sharp(imageArrayBuffer);

        //analyze the image using tessaract
        const worker = await createWorker();
        let ret = await worker.recognize(resultImage.url);
        await worker.terminate();

        //log the result
        log(ret, 'debug', true);

        //reply the result
        await interaction.editReply({
            content: 'The result is: ' + ret.data.text,
        });
    },
};
