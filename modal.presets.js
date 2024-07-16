interaction.showModal(
    new ModalBuilder()
        .setTitle()
        .setCustomId()
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setLabel()
                    .setCustomId()
                    .setPlaceholder()
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
            )
        )
);
