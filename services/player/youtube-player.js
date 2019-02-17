const Player = require('./player');
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

module.exports = class YoutubePlayer extends Player
{
    /**
     * @param youtube
     */
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
     * @param guild command guild
     * @param channel message channel
     * @returns {*}
     */
    async play(guild, channel)
    {
        let queue = this._queue.get(guild.id);
        let connection = guild.voiceConnection;
        let state = this._state.get(guild.id);
        let timeout = this._timeouts.get(guild.id);

        if (!connection) {
            return this.emit('play', 'Music player is not connected to any voice channel. Use `join` command.', guild, channel);
        }
        if (connection.channel.members.size === 1) {
            connection.disconnect();
            return this.emit('play', 'Music player stopped. No people in voice channel. Disconnecting ...', guild, channel);
        }

        if (timeout && timeout.count > 5) {
            return this.emit('play', 'Music player has shut itself down due to failing to play track(s) for too long. Please make sure your music queue is not corrupted.', guild, channel);
        }
        if (!state) state = this._initDefaultState(guild.id);

        if (!queue || !queue.tracks || queue.tracks.length === 0) return this.emit('play', 'Queue for given guild is empty. Use `get` or `search` command.', guild, channel);
        if (!connection) return this.emit('play', 'Not connected to voice channel for given guild.', guild, channel);

        if (connection.dispatcher && connection.dispatcher.paused) {
            return this.emit('play', 'Music played is paused. Please resume playback or stop it before trying to play it.', guild, channel);
        } else if (connection.dispatcher) {
            connection.dispatcher.destroy('play', 'New dispatcher initialized');
        }

        if (queue.queue_end_reached === true && state.loop === true) {
            if (state.shuffle === true) {
                this.shuffle(guild, channel);
            }
            this._resetQueuePosition(guild.id);
            queue = this._queue.get(guild.id);
        } else if (queue.queue_end_reached === true && state.loop === false) return this.emit('play', 'Music has finished playing for given guild. Looping is not enabled.', guild, channel);

        // some youtube tracks may contain interesting utf characters
        // we hash the track title to avoid unnecessary bullshit like that
        // when saving the audio file and streaming/reading it
        let track = this._getTrack(queue);
        const hash = crypto.createHash('sha256');
        hash.update(track.title);

        const trackTitleHash = hash.digest('hex') + '.mp3';
        const fullAudioPath = path.join(YoutubePlayer.DOWNLOAD_DIR(), trackTitleHash);

        if (fs.existsSync(fullAudioPath) === false) {
            if (!state.seek) {
                await this._youtube.download(track.url, fullAudioPath);
            }
        }
        let dispatcher = connection.playFile(fullAudioPath, {seek: state.seek, volume: state.volume, passes: 2});
        dispatcher.on('start', () => {
            console.log('Playing', trackTitleHash);
            state.seek = 0;
            this._state.set(guild.id, state);
            this._timeouts.delete(guild.id);
            this.emit('playing', track, guild, channel);
        });

        dispatcher.on('end', (reason) => {
            console.log('dispatcher end reason', reason);
            if (state.stop === false) {
                this._tryToIncrementQueue(guild.id);
                return this.play(guild, channel);
            } else {
                state.stop = false;
                this._state.set(guild.id, state);
            }
        });

        dispatcher.on('error', e => {
            console.log('error', e);
            this._incrementTimeout(guild.id);
            this._tryToIncrementQueue(guild.id);
            return this.emit('play', `Music player encountered an error trying to play \`${track.title}\`.`, guild, channel);
        });
    }

    /**
     * @param guild
     * @param channel
     */
    shuffle(guild, channel)
    {
        let queue = this._queue.get(guild.id);
        if (queue) {
            if (queue.tracks.length >= 2) {
                queue.tracks = this._randomizeArray(queue.tracks);
                this._queue.set(guild.id, queue);
                this.emit('shuffle', `Music Player has shuffled _${queue.tracks.length}_ records`, guild, channel);
            } else {
                this.emit('shuffle', 'Music Player could not shuffle tracks - not enough tracks present', guild, channel)
            }
        } else {
            this.emit('shuffle', 'Music Player could not shuffle track list at the moment.', guild, channel)
        }
    }

    /**
     * @param guild
     * @param channel
     */
    pause(guild, channel)
    {
        let connection = guild.voiceConnection;
        if (connection && connection.dispatcher && connection.dispatcher.paused === false) {
            connection.dispatcher.pause();
            this.emit('pause', 'Music Player has been paused', guild, channel)
        } else this.emit('pause', 'Music Player could not be paused. Player is not connected or is already paused at the moment.', guild, channel)
    }

    /**
     * @param guild
     * @param channel
     */
    resume(guild, channel)
    {
        let connection = guild.voiceConnection;
        if (connection && connection.dispatcher && connection.dispatcher.paused === true) {
            connection.dispatcher.resume();
            this.emit('resume', 'Music Player has been resumed', guild, channel)
        } else  this.emit('resume', 'Music Player could not be resumed. Player is not connected or is not paused at the moment.', guild, channel)
    }

    /**
     * @param guild
     * @param channel
     */
    skip(guild, channel)
    {
        let state = this._state.get(guild.id);
        let connection = guild.voiceConnection;
        if (state && connection && (connection.dispatcher || connection.speaking === true)) {
            connection.dispatcher.end('skip() method initiated');
            return this.emit('skip', 'Music player is skipping.', guild, channel)
        } else this.emit('skip', 'Music Player could not skip track at the moment. Player not connected or is not playing anything yet.', guild, channel)
    }

    /**
     * @param guild
     * @param timeInSeconds
     * @param timeString
     * @param channel
     */
    seek(guild, timeInSeconds, timeString, channel)
    {
        let connection = guild.voiceConnection;
        let state = this._state.get(guild.id);
        if (state && connection && connection.dispatcher) {
            state.increment_queue = false;
            state.seek = timeInSeconds;
            this._state.set(guild.id, state);

            connection.dispatcher.end('seek() method initiated');
            this.emit('seek', `Seeking player to \`${timeString}\``, guild, channel);
        } else this.emit('seek', 'Player could not seek. Player not connected or is not playing music at the moment.', guild, channel);
    }

    /**
     * @param guild
     * @param position
     * @param channel
     */
    jump(guild, position, channel)
    {
        let connection = guild.voiceConnection;
        let queue = this._queue.get(guild.id);
        let state = this._state.get(guild.id);

        if (connection && connection.dispatcher) {
            if (queue.tracks.length === 0 || queue.tracks.length < position-1) {
                this.emit('info', `Incorrect song number provided. Allowed 1-${queue.tracks.length}]`, guild, channel);
                return;
            }
            state.increment_queue = false;
            this._state.set(guild.id, state);

            queue.position = position - 1;
            this._queue.set(guild.id, queue);

            connection.dispatcher.end('jump() method initiated');

            this.emit('jump', `Player jumping to play track \`#${position} [${queue.tracks[position-1].title}]\``, guild, channel);
        } else {
            this.emit('jump', 'Player could jump to specific song. Player not connected or is not playing music at the moment.', guild, channel);
        }
    }

    /**
     * @param guild
     * @param channel
     */
    stop(guild, channel)
    {
        let state = this._state.get(guild.id);
        let connection = guild.voiceConnection;
        if (connection && connection.dispatcher) {
            if (state) {
                state.stop = true;
                this._state.set(guild.id, state);
                this.emit('stop', 'Music player has been stopped.', guild, channel);
                this.emit('update', guild, channel, true);
            }
            connection.dispatcher.destroy('stop', 'manual dispatcher destroy init');
        } else {
            this.emit('stop', 'Music Player could not be stopped. Player not connected.', guild, channel)
        }
    }

    /**
     *
     * @param guild
     * @param volume
     * @param channel
     */
    setVolume(guild, volume, channel)
    {
        let connection = guild.voiceConnection;
        let state = this._state.get(guild.id);
        if (connection && connection.dispatcher) {
            connection.dispatcher.setVolume(volume / 100.0);
            state.volume = volume / 100.0;
            this._state.set(guild.id, state);
            this.emit('volume', `Music player volume has been set to \`${volume}\``, guild, channel);
            this.emit('update', guild, channel);
        } else this.emit('volume', 'Music Player is not active at the moment. Can not set volume.', guild, channel)
    }

    /**
     * Listener tracks important music player changes and updates player message accordingly
     * @private
     */
    _registerListener()
    {
        this.on('update', async (guild, channel, stopped = false) => {
            let message = this.messages.get(guild.id);
            if (message && message.deletable) {
                channel = message.channel;
                message.delete();
            } if (stopped === false && message && channel) {
                this.messages.set(guild.id, await channel.send('', {embed: this.getInfo(guild)}));
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
                .addField('Requested By', guild.members.get(track.added_by) || '?', true)
                .setImage(track.image)
                .setTimestamp();
            return embed;
        }
        return null;
    }

};