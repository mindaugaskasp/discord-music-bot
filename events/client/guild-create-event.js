const Event = require('./event');

module.exports = class GuildCreateEvent extends Event
{
    constructor(client)
    {
        super(client);
    }

    handle()
    {
        let config = this.client.config;
        this.client.on('guildCreate', async (guild) => {
            if (guild.available) {
                let message = `Hi, \`${guild.name}\`, I am a super simplistic Music BOT, please refer to _help_ (use command: **${config.bot.default_cmd_prefix}help**) manual for commands.` +
                    `All commands by default start with prefix **${config.bot.default_cmd_prefix}**. However, you can set your own custom prefix by using command \`${config.bot.default_cmd_prefix}prefix [prefix_characters]\``;
                let channel = guild.channels.find('type', 'text');
                if (channel && guild.channels.get(channel.id)) await channel.send(message);
            }
        });
        return this;
    }
};