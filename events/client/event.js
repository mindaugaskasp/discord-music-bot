module.exports = class Event
{
    constructor(client)
    {
        this.client = client;
    }

    handle()
    {
        throw 'handle() method not implemented';
    }
};