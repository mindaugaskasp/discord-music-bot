const Event = require('./event');

module.exports = class ReadyEvent extends Event
{
    constructor(client)
    {
        super(client);
    }

    handle()
    {
        this.client.on('ready', () => {
            console.log('Logged in!');
            this.client.user.setActivity(this.client.config.bot.activity_text);
        });
        return this;
    }
};