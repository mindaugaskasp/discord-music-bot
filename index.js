const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const path = require('path');
const config = require('./configs/app.json');
const YoutubePlayer = require('./services/player/youtube-player');
const sqlite = require('sqlite');
const TimeArgumentType = require('./arguments/time-argument');
const Youtube = require('@mindaugaskasp/node-youtube');
const EventLoaderService = require('./services/event-loader-service');

sqlite.open(path.join(`${__dirname}/sqlite`, "database.sqlite3")).then((db) => {
    client.setProvider(new SQLiteProvider(db));
});

const client = new CommandoClient({
    commandPrefix: config.bot.default_cmd_prefix,
    unknownCommandResponse: false,
    owner: config.bot.owners,
    disableEveryone: true
});

client.config = config;
client.music = new YoutubePlayer(new Youtube(config.youtube.token, config.youtube.base_url));

new EventLoaderService(client).load();

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['music', 'Music playback commands']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerTypes([TimeArgumentType])
    .registerCommandsIn(path.join(__dirname, 'commands'));

process.on('unhandledRejection', console.error);

client.login(config.bot.token);