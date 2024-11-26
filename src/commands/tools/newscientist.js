const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const RSSParser = require('rss-parser');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newscientist')
        .setDescription('Choose a feed to get the latest articles from New Scientist'),
    async execute(interaction) {
        // Create a dropdown menu
        const menu = new StringSelectMenuBuilder()
            .setCustomId('newscientist_feed_select')
            .setPlaceholder('Select a feed...')
            .addOptions([
                {
                    label: 'General',
                    description: 'Get general articles from New Scientist',
                    value: 'https://www.newscientist.com/feed/home',
                },
                {
                    label: 'Technology',
                    description: 'Get technology articles from New Scientist',
                    value: 'https://www.newscientist.com/subject/technology/feed/',
                },
                {
                    label: 'Humans',
                    description: 'Get environment articles from New Scientist',
                    value: 'https://www.newscientist.com/subject/humans/feed/',
                },
                {
                    label: 'Health',
                    description: 'Get health articles from New Scientist',
                    value: 'https://www.newscientist.com/subject/health/feed/',
                },
                {
                    label: 'Space',
                    description: 'Get space articles from New Scientist',
                    value: 'https://www.newscientist.com/subject/space/feed/',
                },
                {
                    label: 'Physics',
                    description: 'Get physics articles from New Scientist',
                    value: 'https://www.newscientist.com/subject/physics/feed/',
                },
                {
                    label: 'Earth',
                    description: 'Get climate change articles from New Scientist',
                    value: 'https://www.newscientist.com/subject/earth/feed/',
                },
                {
                    label: 'Life',
                    description: 'Get evolution articles from New Scientist',
                    value: 'https://www.newscientist.com/subject/life/feed/',
                },
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({
            content: 'Choose a feed to see the latest articles:',
            components: [row],
            ephemeral: true, // Visible only to the user
        });
    },
    
    async handleSelect(interaction) {
        const parser = new RSSParser();
        const feedUrl = interaction.values[0]; // Selected feed URL
    
        // Retry mechanism for fetching the feed
        async function fetchFeedWithRetry(url, retries = 3) {
            try {
                const feed = await parser.parseURL(url);
                return feed;
            } catch (error) {
                if (retries === 0) {
                    throw error;
                }
                console.warn(`Retrying...(${retries} attempts left)`);
                return fetchFeedWithRetry(url, retries - 1);
            }
        }
    
        // Cleanup XML if necessary (e.g., handling attributes without values)
        const cleanXML = xml => {
            return xml.replace(/<([a-zA-Z0-9\-]+)(?=\s)(?!.*?=[^>]+>)/g, '<$1 />'); // Replace empty attributes with self-closing
        };
    
        try {
            await interaction.deferUpdate();
    
            // Log the feed URL to make sure it's being passed correctly
            console.log('Selected feed URL:', feedUrl);
    
            // Fetch the feed with retry logic
            let feed = await fetchFeedWithRetry(feedUrl);
    
            // Log the feed object for debugging
            console.log('Parsed feed:', feed);
    
            // Get the 3 most recent articles
            const latestArticles = feed.items.slice(0, 3).map(article => {
                return `**${article.title}**\n${article.link}`;
            });
    
            // Send articles in response
            await interaction.editReply({
                content: latestArticles.join('\n\n'),
                components: [], // Remove dropdown menu after selection
            });
        } catch (error) {
            console.error('Error fetching RSS feed:', error);
    
            // Add more specific logging to diagnose
            await interaction.editReply({
                content: 'Could not fetch articles. Please try again later.',
                components: [],
            });
        }
    }
}    