const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const path = require('path');
const config = require('./configs/app.json');
const YoutubePlayer = require('discord-helpers/youtube-player');
const sqlite = require('sqlite');
const TimeArgumentType = require('./arguments/time-argument');
const Youtube = require('discord-helpers/integrations/youtube');
const ListenMoe = require('discord-helpers/integrations/listen-moe/moe');
const MoePlayer = require('discord-helpers/radio-player');
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

new EventLoaderService(client).load();

// custom objects are attached to the client
client.config = config;
client.music = new YoutubePlayer(new Youtube(config.youtube.token, config.youtube.base_url));
client.moe_radio = new MoePlayer(new ListenMoe(config.listen_moe.username, config.listen_moe.password), config.listen_moe);
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
debugger;