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
            this.client.user.setGame(this.client.config.bot.game);
        });
        return this;
    }
};