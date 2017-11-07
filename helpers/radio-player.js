const EventEmitter = require('events');
const Discord = require('discord.js');

module.exports = class BasePlayer extends EventEmitter
{
    /**
     *
     * @param listenMoe
     * @param config
     */
    constructor(listenMoe, config)
    {
        super();
        this._listenMoe = listenMoe;
        this._listenMoe.openSocket();

        this._state = new Map();
        this.config = config;
    }

    /**
     *
     * @param guild
     * @returns {PromiseConstructor | Promise}
     */
    stream(guild)
    {
        let connection = guild.voiceConnection;

        if (connection && this._state.get(guild.id)) return this.emit('stream', 'I am already playing radio.', guild);
        if (connection && connection.dispatcher) connection.dispatcher.destroy('radio', 'new radio stream initialized');

        let dispatcher = connection.playStream(this.config.stream, {passes: 3});
        dispatcher.on('start', () => {
            this._state.set(guild.id, {listening: true});
            this.emit('streaming', this.getInfo(guild), guild);
        });
        dispatcher.on('end', (reason) => {
            console.log("Dispatcher end event", reason);
            this._state.delete(guild.id);
            this.emit('streaming', guild, null)
        });
        dispatcher.on('error', (reason) => {
            console.log('Dispatcher error event:', reason);
            this._state.delete(guild.id);
        });

        this._listenMoe.socket.on(`update`, data => {
            let state = this._state.get(guild.id);
            if (state && state.listening)  {
                this._state.set(guild.id, {listening: true});
                if (connection.channel.members.size === 1) {
                    this._state.delete(guild.id);
                    this.emit('stream', 'No users in voice channel. Turning off radio for now.', guild);
                    connection.disconnect();
                } else this.emit('streaming', this.getInfo(guild), guild);
            }
        });

    }

    /**
     * @param guild
     * @returns {*}
     */
    getInfo(guild)
    {
        let data = this._listenMoe.socket.info;
        let connection = guild.voiceConnection;
        if (connection && connection.dispatcher) {
            let embed = new Discord.RichEmbed();
            embed
                .setAuthor(`Playing - 🎵 ${data.artist_name.toUpperCase()} - ${data.song_name.toUpperCase()} 🎵`, this.config.image, this.config.url)
                .setColor('RANDOM')
                .addField('Author', `${data.last.artist_name} - ${data.last.song_name}`, true)
                .addField('Requested By', data.requested_by || 'Unknown', true)
                .setImage(this.config.image)
                .setTimestamp();
            return embed;
        }
        return null;
    }
};