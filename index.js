const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const path = require('path');
const config = require('./configs/app.json');
const Player = require('./helpers/music-player');
const sqlite = require('sqlite');

sqlite.open(path.join(`${__dirname}/sqlite`, "settings.sqlite3")).then((db) => {
    client.setProvider(new SQLiteProvider(db));
});

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
        ['music', 'Music playback commands']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
    console.log('Logged in!');
    client.user.setGame('Game');
});

process.on('unhandledRejection', console.error);

client.login(config.bot.token);