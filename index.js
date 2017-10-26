const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const config = require('./configs/app.json');

const client = new CommandoClient({
    commandPrefix: config.bot.default_cmd_prefix,
    unknownCommandResponse: false,
    owner: config.bot.owners,
    disableEveryone: true
});

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