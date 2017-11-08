const Event = require('./event');

module.exports = class CommandRunEvent extends Event
{
    constructor(client)
    {
        super(client);
    }

    handle()
    {
        this.client.on('commandRun', (cmd, promise, msg, args) => {
            let channel = msg.channel;
            if (channel && msg.guild.channels.get(channel.id) && channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES') && this.client.config.bot.delete_cmd_messages === true) {
                msg.delete(2000);
            } else if (channel && msg.guild.channels.get(channel.id) && typeof channel.permissionsFor === 'function' && channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES') === false){
                console.log(`Missing Permission MANAGE_MESSAGES for Guild ${msg.guild.id}/${msg.guild.name}`);
            }
        });
        return this;
    }
};