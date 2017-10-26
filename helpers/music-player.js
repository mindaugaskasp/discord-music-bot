const EventEmitter = require('events');
const ytdl = require('ytdl-core');

module.exports = class MusicPlayer extends EventEmitter
{
    constructor()
    {
        super();
        this._queue = new Map();
        this._state = new Map();
    }

    play(guildID)
    {
        //TODO complete this method
    }

    pause(guildID)
    {
        //TODO complete this method
    }

    resume(guildID)
    {
        //TODO complete this method
    }

    skip(guildID)
    {
        //TODO complete this method
    }

    seek(guildID)
    {
        //TODO complete this method
    }

    jump(guildID)
    {
        //TODO complete this method
    }

    stop(guildID)
    {
        //TODO complete this method
    }


};