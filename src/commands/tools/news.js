const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('news')
        .setDescription('Get the latest news headlines from The Guardian!')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Search for specific news topics (e.g., technology, sports)')
                .setRequired(false)),
    async execute(interaction) {
        const query = interaction.options.getString('query') || 'world'; 
        const apiKey = process.env.GUARDIAN_API_KEY;
        const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${apiKey}`;

        try {
            await interaction.deferReply(); 

            const response = await axios.get(url);
            const articles = response.data.response.results;

            if (!articles.length) {
                return interaction.editReply(`No news found for "${query}". Try another topic.`);
            }

            
            const newsList = articles.slice(0, 5).map(article => 
                `**[${article.webTitle}](${article.webUrl})**`
            ).join('\n\n');

            await interaction.editReply({
                content: `📰 **Latest news for "${query}":**\n\n${newsList}`,
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: '❌ An error occurred while fetching the news. Please try again later.',
                ephemeral: true
            });
        }
    }
};
