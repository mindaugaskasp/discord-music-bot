const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const path = require('path');
const config = require('./configs/app.json');
const YoutubePlayer = require('./helpers/youtube-player');
const sqlite = require('sqlite');
const TimeArgumentType = require('./arguments/time-argument');
const Youtube = require('./helpers/integrations/youtube');
const ListenMoe = require('./helpers/integrations/listen-moe/moe');
const MoePlayer = require('./helpers/radio-player');

sqlite.open(path.join(`${__dirname}/sqlite`, "database.sqlite3")).then((db) => {
    client.setProvider(new SQLiteProvider(db));
});

const client = new CommandoClient({
    commandPrefix: config.bot.default_cmd_prefix,
    unknownCommandResponse: false,
    owner: config.bot.owners,
    disableEveryone: true
});

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

client.on('ready', () => {
    console.log('Logged in!');
    client.user.setGame(config.bot.game);
});

process.on('unhandledRejection', console.error);

client.login(config.bot.token);

client.on('commandRun', (cmd, promise, msg, args) => {
    let channel = msg.channel;
    if (config.bot.delete_cmd_messages === true && channel && channel.permissionsFor(client.user).has('MANAGE_MESSAGES')) {
        msg.delete(2000);
    } else if (channel && typeof channel.permissionsFor === 'function' && channel.permissionsFor(client.user).has('MANAGE_MESSAGES') === false){
        console.log(`Missing Permission MANAGE_MESSAGES for Guild ${msg.guild.id}/${msg.guild.name}`);
    }
});

client.on('guildCreate', async (guild) => {
    if (guild.available) {
        let message = `Hi, \`${guild.name}\`, I am a super simplistic Music BOT, please refer to _help_ (use command: **${config.bot.default_cmd_prefix}help**) manual for commands.` +
            `All commands by default start with prefix **${config.bot.default_cmd_prefix}**. However, you can set your own custom prefix by using command \`${config.bot.default_cmd_prefix}prefix [prefix_characters]\``;
        let channel = guild.channels.find('type', 'text');
        await channel.send(message);
    }
});
debugger;