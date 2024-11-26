const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

module.exports = (client) => {
    client.handleCommands = async() => {
        const commandFolders = fs.readdirSync('./src/commands');
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
            
            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);

                //new below
                if (!command.data || !command.data.name) {
                    console.error(`Command in file ${file} is missing data.name. Skipping.`);
                    continue;
                }
                //new up

                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
            }
        }
        
        require('dotenv').config(); // Load .env variables

        const clientId = process.env.clientID;
        const guildId1 = process.env.guildID1;
        const guildId2 = process.env.guildID2;
        const token = process.env.token;

        const rest = new REST({ version: '9' }).setToken(process.env.token);
        try {
            console.log('Started refreshing application (/) commands.');
        
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId1),
                { body: client.commandArray },
            );

            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId2),
                { body: client.commandArray },
            );
        
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
        
    };
};