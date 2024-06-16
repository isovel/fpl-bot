const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const { log } = require('../../../functions');
//import tesseract from 'tesseract.js';
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
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        //check if screenshot is jpg/png
        const imageAtachment = interaction.options.getAttachment('screenshot');

        if (!['image/jpeg', 'image/png'].includes(imageAtachment.contentType)) {
            return interaction.reply({
                content: 'The provided file is not a jpg or png image.',
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
