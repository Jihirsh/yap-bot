module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        // Check if the interaction is a chat input command
        if (interaction.isChatInputCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: `Something went wrong while executing this command...`,
                    ephemeral: true
                })
            }
        }

        // Check if the interaction is a select menu interaction (for newscientist feed selection)
        if (interaction.isStringSelectMenu() && interaction.customId === 'newscientist_feed_select') {
            // Get the command that handles the feed selection
            const command = client.commands.get('newscientist');
            if (command && command.handleSelect) {
                return command.handleSelect(interaction);
            }
        }
    },
};