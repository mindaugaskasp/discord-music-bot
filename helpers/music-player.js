const EventEmitter = require('events');
const ytdl = require('ytdl-core');

module.exports = class MusicPlayer extends EventEmitter
{
    constructor()
    {
        super();
        this._queue = new Map();
        this._state = new Map();
        this.searches = new Map();
    }

    /**
     *
     * @param guild
     * @returns {*}
     */
    play(guild)
    {
        let queue = this._queue.get(guild.id);
        let connection = guild.voiceConnection;
        let state = this._state.get(guild.id);
        if (!state) state = this._initState(guild.id);

        if (!queue || !queue.tracks || queue.tracks.length === 0) return this.emit('info', 'Queue for given guild is empty.', guild);
        if (!connection) return this.emit('info', 'Not connected to voice channel for given guild.', guild);

        state.currently_playing = true;
        this._state.set(guild.id, state);

        let track = queue.tracks[queue.position];
        track['position'] = queue.position;
        track['total'] = queue.tracks.length;

        let stream = ytdl(track.url, {filter: 'audioonly', quality: 'lowest'});
        let dispatcher = connection.playStream(stream, {passes: state.passes, volume: state.volume, seek: state.seek});

        if (queue.queue_end_reached === true && state.loop === true) {
            this._resetQueuePosition(guild.id);
            track = queue.tracks[0];
        } else if (queue.queue_end_reached === true && state.loop === false)
            return this.emit('info', 'Music has finished playing for given guild. Looping is not enabled.', guild);

        dispatcher.on('start', () => {
            // resetting state data during playback
            state.seek = 0;
            state.increment_queue = true;
            this._state.set(guild.id, state);

            console.log(`Playback start for ${guild.id}/${guild.name} [${track.title} - ${track.url}]`);
            this.emit('playing', track, guild);
        });

        dispatcher.on('end', () => {
            console.log(`Playback over for ${guild.id}/${guild.name} [${track.title} - ${track.url}]`);
            this._incrementQueue(guild.id);
            if (state.stop === false) this.play(guild);
            else this._initState(guild);
        });

        state.currently_playing = false;
        this._state.set(guild.id, state);
    }

    /**
     * TODO test this
     * @param guild
     */
    pause(guild)
    {
        let connection = guild.voiceConnection;
        if (connection && connection.dispatcher && connection.dispatcher.paused === false) {
            connection.dispatcher.pause();
            this.emit('info', 'Music Player has been paused', guild)
        } else  this.emit('info', 'Music Player could not be paused. Player is not connected or is already paused at the moment.', guild)
    }

    /**
     * TODO test this
     * @param guild
     */
    resume(guild)
    {
        let connection = guild.voiceConnection;
        if (connection && connection.dispatcher && connection.dispatcher.paused === true) {
            connection.dispatcher.resume();
            this.emit('info', 'Music Player has been resumed', guild)
        } else  this.emit('info', 'Music Player could not be resumed. Player is not connected or is not paused at the moment.', guild)
    }

    /**
     * TODO test this
     * @param guild
     */
    skip(guild)
    {
        let connection = guild.voiceConnection;
        if (connection && connection.dispatcher) {
            connection.dispatcher.end('skip command initiated');
            this.emit('info', 'Music player is skipping', guild)
        } else  this.emit('info', 'Music Player could not skip track at the moment. Player not connected.', guild)
    }

    /**
     * TODO test this
     * @param guild
     * @param timeInSeconds
     */
    seek(guild, timeInSeconds)
    {
        let connection = guild.voiceConnection;
        let state = this._state(guild.id);
        if (connection && connection.dispatcher) {
            state.increment_queue = false;
            state.seek = timeInSeconds;
            this._state.set(guild.id, state);
            this.skip(guild);
            this.emit('info', `Seeking player to \`${timeInSeconds/60}:${timeInSeconds%60}\``, guild);
        } else this.emit('info', 'Player could not seek. Player not connected or is not playing music at the moment.', guild);
    }

    /**
     * TODO test this
     * @param guild
     * @param position
     * @returns {Emitter|*}
     */
    jump(guild, position)
    {
        let connection = guild.voiceConnection;
        let state = this._state(guild.id);
        let queue = this._queue.get(guild.id);
        if (connection && connection.dispatcher) {
            if (queue.tracks.length === 0 || queue.tracks.length < position-1)
                return this.emit('info', `Incorrect song number. Available range [0-${queue.tracks.length}]`);

            this.skip(guild);
            state.position = position - 2;
            this._state.set(guild.id, state);
            this.emit('info', `Player jumping to play track #${position} [${queue.tracks[position-1]}]`, guild);
        } else this.emit('info', 'Player could jump to specific song. Player not connected or is not playing music at the moment.', guild);
    }

    /**
     * TODO test this
     * @param guild
     */
    stop(guild)
    {
        let state = this._state.get(guild.id);
        let connection = guild.voiceConnection;
        if (connection && connection.dispatcher) {
            state.stop = true;
            this._state.set(guild.id, state);
            connection.dispatcher.destroy('skip command initiated');
            this.emit('info', 'Music player has been stopped.', guild)
        } else  this.emit('info', 'Music Player could not be stopped. Player not connected.', guild)
    }

    /**
     * @param track
     * @param guild
     */
    loadTrack(track, guild)
    {
        this._validateTrackObject(track);

        let queue = this._queue.get(guild.id);
        if (!queue) queue = this._getDefaultQueueObject(guild.id);
        queue.tracks.push(track);

        this._queue.set(guild.id, queue);
    }

    /**
     *
     * @param tracks
     * @param guild
     */
    loadTracks(tracks, guild)
    {
        if (Array.isArray(tracks) === false) throw 'Tracks must be contained in array';
        for (let track of tracks) this._validateTrackObject(track);

        let queue = this._queue.get(guild.id);
        if (!queue) queue = this._getDefaultQueueObject(guild.id);

        queue.tracks = queue.tracks.concat(tracks);
        this._queue.set(guild.id, queue);
    }

    /**
     * @param guildID
     * @private
     */
    _initState(guildID)
    {
        let state = {
            passes: 2,
            seek: 0,
            volume: 1,
            currently_playing: true,
            increment_queue: true,
            loop: true,
            stop: false,
            last_action_timestamp: null
        };
        this._state.set(guildID, state);

        return state;
    }

    /**
     *
     * @param guildID
     * @private
     */
    _incrementQueue(guildID)
    {
        let queue = this._queue.get(guildID);
        if (!queue) throw 'Can\'t increment queue - map not initialized';

        if (queue.position >= queue.tracks.length) queue.queue_end_reached = true;
        queue.position++;

        this._queue.set(guildID, queue);
    }

    /**
     *
     * @param guildID
     * @private
     */
    _resetQueuePosition(guildID)
    {
        let queue = this._queue(guildID);
        queue.position = 0;
        this._queue.set(guildID, queue);
    }

    /**
     *
     * @param guildID
     * @returns {{guild_id: *, tracks: Array, position: number}}
     * @private
     */
    _getDefaultQueueObject(guildID)
    {
        return {
            guild_id: guildID,
            tracks: [],
            position: 0,
            queue_end_reached: false,
            created_timestamp: new Date().getTime(),
        }
    }

    /**
     *
     * @param track
     * @returns {boolean}
     * @private
     */
    _validateTrackObject(track)
    {
        if (!track.title) throw 'Track object must specify track name [track.title]';
        if (!track.url) throw 'Track must specify stream url [track.url]';
        if (!track.source) throw 'Track must specify stream source [track.source]';
        if (!track.image) throw 'Track must specify stream image [track.image]';

        return true;
    }
};