const Event = require('./event');

module.exports = class GuildCreateEvent extends Event
{
    /**
     * @param client
     */
    constructor(client)
    {
        super(client);
    }

    /**
     * Sends welcome message on guild create event - which is emitted when bot is being added to the guild
     * @returns {module.GuildCreateEvent}
     */
    handle()
    {
        this.client.on('guildCreate', async (guild) => {
            if (guild.available) {
                let config = this.client.config;
                if (!config) {
                    console.log('Config error', this.client.config);
                }
                let message = `Hi, \`${guild.name}\`, I am a super simplistic music bot, please refer to _help_ (use command: **${config.bot.default_cmd_prefix}help**) manual for commands.` +
                    `All commands by default start with prefix **${config.bot.default_cmd_prefix}**. However, you can set your own custom prefix by using command \`${config.bot.default_cmd_prefix}prefix [prefix_characters]\``;
                let channel = guild.channels.find('type', 'text');
                if (channel && guild.channels.get(channel.id)) {
                    await channel.send(message);
                }
            }
        });
        return this;
    }
};