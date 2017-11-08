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
            if (this.client.config.bot.delete_cmd_messages === true && channel && channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) {
                msg.delete(2000);
            } else if (channel && typeof channel.permissionsFor === 'function' && channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES') === false){
                console.log(`Missing Permission MANAGE_MESSAGES for Guild ${msg.guild.id}/${msg.guild.name}`);
            }
        });
        return this;
    }
};