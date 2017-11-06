const BasePlayer = require('./base-player');
const Discord = require('discord.js');

module.exports = class MusicPlayer extends BasePlayer
{
    constructor(youtube)
    {
        super(youtube);
        this.messages = new Map();
        this._registerListener();
    }

    /**
     *
     * @param guild
     * @param message
     */
    savePlayerMessage(guild, message)
    {
        this.messages.set(guild.id, message);
    }

    /**
     * method used to play music queue tracks only
     * @param guild
     * @returns {*}
     */
    async play(guild)
    {
        let queue = this._queue.get(guild.id);
        let connection = guild.voiceConnection;
        let state = this._state.get(guild.id);
        let timeout = this._timeouts.get(guild.id);

        if (connection.channel.members.size === 1) {
            connection.disconnect();
            return this.emit('play', 'Music player stopped. No people in voice channel. Disconnecting...');
        }

        if (timeout && timeout.count > 5) return this.emit('play', 'Music player has shut itself down due to failing to play track(s) for too long. Please make sure your music queue is not corrupted.', guild);
        if (!state) state = this._initDefaultState(guild.id);

        if (!queue || !queue.tracks || queue.tracks.length === 0) return this.emit('play', 'Queue for given guild is empty.', guild);
        if (!connection) return this.emit('play', 'Not connected to voice channel for given guild.', guild);

        if (queue.queue_end_reached === true && state.loop === true) {
            if (state.shuffle === true) this.shuffle(guild);
            this._resetQueuePosition(guild.id);
            queue = this._queue.get(guild.id);
        } else if (queue.queue_end_reached === true && state.loop === false) return this.emit('play', 'Music has finished playing for given guild. Looping is not enabled.', guild);

        let track = this._getTrack(queue);
        await this._youtube.download(track.url, `${MusicPlayer.DOWNLOAD_DIR()}/${guild.id}`);
        let dispatcher = connection.playFile(`${MusicPlayer.DOWNLOAD_DIR()}/${guild.id}`, {seek: state.seek, volume: state.volume, passes: 2});

        dispatcher.on('start', () => {
            state.seek = 0;
            this._state.set(guild.id, state);
            this._timeouts.delete(guild.id);
            this.emit('playing', track, guild);
        });

        dispatcher.on('end', (reason) => {
            console.log('Dispatcher end event', reason);
            if (state.stop === false) {
                this._TryToIncrementQueue(guild.id);
                return this.play(guild);
            } else {
                state.stop = false;
                this._state.set(guild.id, state);
            }
        });

        dispatcher.on('error', e => {
            console.log(e);
            this._incrementTimeout(guild.id);
            this._TryToIncrementQueue(guild.id);
            return this.emit('play', `Music player encountered an error trying to play \`${track.title}\`.`, guild);
        });
    }

    /**
     * @param guild
     */
    shuffle(guild)
    {
        let queue = this._queue.get(guild.id);
        if (queue) {
            if (queue.tracks.length >= 2) {
                queue.tracks = this._randomizeArray(queue.tracks);
                this._queue.set(guild.id, queue);
                this.emit('shuffle', `Music Player has shuffled _${queue.tracks.length}_ records`, guild);
            } else this.emit('shuffle', 'Music Player could not shuffle tracks - not enough tracks present', guild)
        } else this.emit('shuffle', 'Music Player could not shuffle track list at the moment.', guild)
    }

    /**
     * @param guild
     */
    pause(guild)
    {
        let connection = guild.voiceConnection;
        if (connection && connection.dispatcher && connection.dispatcher.paused === false) {
            connection.dispatcher.pause();
            this.emit('pause', 'Music Player has been paused', guild)
        } else this.emit('pause', 'Music Player could not be paused. Player is not connected or is already paused at the moment.', guild)
    }

    /**
     * @param guild
     */
    resume(guild)
    {
        let connection = guild.voiceConnection;
        if (connection && connection.dispatcher && connection.dispatcher.paused === true) {
            connection.dispatcher.resume();
            this.emit('resume', 'Music Player has been resumed', guild)
        } else  this.emit('resume', 'Music Player could not be resumed. Player is not connected or is not paused at the moment.', guild)
    }

    /**
     * @param guild
     */
    skip(guild)
    {
        let connection = guild.voiceConnection;
        if (connection && (connection.dispatcher || connection.speaking === true)) {
            connection.dispatcher.end('skip() method initiated');
            return this.emit('skip', 'Music player is skipping.', guild)
        } else this.emit('skip', 'Music Player could not skip track at the moment. Player not connected or is not playing anything yet.', guild)
    }

    /**
     * @param guild
     * @param timeInSeconds
     * @param timeString
     */
    seek(guild, timeInSeconds, timeString)
    {
        let connection = guild.voiceConnection;
        let state = this._state.get(guild.id);
        if (state && connection && connection.dispatcher) {
            state.increment_queue = false;
            state.seek = timeInSeconds;
            this._state.set(guild.id, state);

            connection.dispatcher.end('seek() method initiated');
            this.emit('seek', `Seeking player to \`${timeString}\``, guild);
        } else this.emit('seek', 'Player could not seek. Player not connected or is not playing music at the moment.', guild);
    }

    /**
     * @param guild
     * @param position
     * @returns {Emitter|*}
     */
    jump(guild, position)
    {
        let connection = guild.voiceConnection;
        let queue = this._queue.get(guild.id);
        let state = this._state.get(guild.id);

        if (connection && connection.dispatcher) {
            if (queue.tracks.length === 0 || queue.tracks.length < position-1)
                return this.emit('info', `Incorrect song number provided. Allowed 1-${queue.tracks.length}]`);

            state.increment_queue = false;
            this._state.set(guild.id, state);

            queue.position = position - 1;
            this._queue.set(guild.id, queue);

            connection.dispatcher.end('jump() method initiated');

            this.emit('jump', `Player jumping to play track \`#${position} [${queue.tracks[position-1].title}]\``, guild);
        } else this.emit('jump', 'Player could jump to specific song. Player not connected or is not playing music at the moment.', guild);
    }

    /**
     * @param guild
     */
    stop(guild)
    {
        let state = this._state.get(guild.id);
        let connection = guild.voiceConnection;
        if (connection && connection.dispatcher) {
            state.stop = true;
            this._state.set(guild.id, state);
            connection.dispatcher.destroy('stop() method initiated');
            this.emit('stop', 'Music player has been stopped.', guild);
            this.emit('update', guild, true);
        } else this.emit('stop', 'Music Player could not be stopped. Player not connected.', guild)
    }

    /**
     *
     * @param guild
     * @param volume
     */
    setVolume(guild, volume)
    {
        let connection = guild.voiceConnection;
        let state = this._state.get(guild.id);
        if (connection && connection.dispatcher) {
            connection.dispatcher.setVolume(volume / 100.0);
            state.volume = volume / 100.0;
            this._state.set(guild.id, state);
            this.emit('volume', `Music player volume has been set to \`${volume}\``, guild);
            this.emit('update', guild);
        } else this.emit('volume', 'Music Player is not active at the moment. Can not set volume.', guild)
    }

    /**
     * Listener tracks important music player changes and updates player message accordingly
     * @private
     */
    _registerListener()
    {
        this.on('update', (guild, stopped = false) => {
            let message = this.messages.get(guild.id);
            if (message && message.deletable) message.delete();
            if (stopped === false && message) {
                let channel = message.channel;
                this.messages.set(guild.id, channel.send('', {embed: this.getInfo(guild)}));
            } else if (stopped === true) {
                this.messages.delete(guild.id);
            }
        })
    }

    /**
     * Gets music player info
     * @param guild
     * @returns {*}
     */
    getInfo(guild)
    {
        let connection = guild.voiceConnection;
        if (connection && connection.dispatcher) {
            let queue = this._queue.get(guild.id);
            let track = queue.tracks[queue.position];

            let embed = new Discord.RichEmbed();
            embed
                .setAuthor(`Playing - 🎵 ${track.title} | ${track.source} 🎵`, track.image, track.url)
                .setColor('RANDOM')
                .addField('Song Number', `${track.position+1} / ${track.total}`, true)
                .addField('Duration', `${track.duration}`, true)
                .addField('Volume', `${connection.dispatcher.volume * 100} %`, true)
                .addField('Requested By', guild.members.get(track.added_by) || 'Unknown', true)
                .setTimestamp();
            return embed;
        }
        return null;
    }

};