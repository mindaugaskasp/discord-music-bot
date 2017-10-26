const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const config = require('./configs/app.json');
const Player = require('./helpers/music-player');

const client = new CommandoClient({
    commandPrefix: config.bot.default_cmd_prefix,
    unknownCommandResponse: false,
    owner: config.bot.owners,
    disableEveryone: true
});

// custom objects are attached to client
client.config = config;
client.music = new Player();

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['Music', 'Music playback commands']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
    console.log('Logged in!');
    client.user.setGame('Game');
});

client.login(config.bot.token);