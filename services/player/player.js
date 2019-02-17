const ffmpeg = require('fluent-ffmpeg');
const promise = require('promised-io/promise');
const fs = require('fs');
const EventEmitter = require('events');

module.exports = class Player extends EventEmitter
{
    /**
     *
     * @returns {string}
     * @constructor
     */
    static DOWNLOAD_DIR()
    {
        return 'downloads'
    };

    constructor(youtube)
    {
        super();
        this._youtube = youtube;
        this._queue = new Map();
        this._state = new Map();
        this._timeouts = new Map();
        this.searches = new Map();

        if (!fs.existsSync(`${Player.DOWNLOAD_DIR()}`)) {
            fs.mkdirSync(`${Player.DOWNLOAD_DIR()}`);
        }
    }

    /**
     * Terminates state
     */
    terminate()
    {
        this._initDefaultState();
    }

    /**
     *
     * @param guild
     * @returns {*}
     */
    getMusicQueue(guild)
    {
        let queue = this._queue.get(guild.id);
        if (queue) return queue.tracks;
        return [];
    }

    /**
     * @param guild
     * @param position
     */
    removeTrack(guild, position, channel)
    {
        let queue = this._queue.get(guild.id);
        if (!queue) {
            return;
        }
        if (position === 0) {
            queue.position = 0;
            queue.tracks = [];
            this._queue.set(guild.id, queue);
            this.emit('remove', `Removing \`ALL\` tracks from the queue. Total: \`${queue.tracks.length}\``, guild, channel);
        } else {
            if (position-1 >= queue.tracks.length) {
                return this.emit('remove', `Invalid track number provided. Allowed: 1-${queue.tracks.length}`, guild, channel);
            }
            this.emit('remove', `Removing \`${queue.tracks[position-1].title}\` from the queue.`, guild, channel);
            let firstHalf = position - 1 === 0 ? [] : queue.tracks.splice(0, position - 1);
            let secondHalf = queue.tracks.splice(position-1 === 0 ? position : position-1, queue.tracks.length);
            queue.tracks = firstHalf.concat(secondHalf);
            this._queue.set(guild.id, queue);
        }
    }

    /**
     *
     * @param array
     * @returns {*}
     * @private
     */
    _randomizeArray(array)
    {
        if (array.length >= 2) {
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                let temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }
        return array;
    }

    /**
     *
     * @param guildID
     * @param stream
     * @returns {Promise|PromiseConstructor}
     * @private
     */
    _convertToAudio(guildID, stream)
    {
        let deferred = promise.defer();

        (new ffmpeg(stream))
            .noVideo()
            .saveToFile(`${Player.DOWNLOAD_DIR()}/${guildID}.mp3`)
            .on('error', (e) => {
                console.log(e);
                deferred.reject(e);
            })
            .on('end', () => {
                deferred.resolve(true);
            });

        return deferred.promise;
    }

    /**
     * @param track
     * @param guild
     * @param userID
     */
    loadTrack(track, guild, userID)
    {
        track['added_by'] = userID;
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
     * @param userID
     */
    loadTracks(tracks, guild, userID = null)
    {
        if (Array.isArray(tracks) === false) {
            throw 'Tracks must be stored in array';
        }
        for (let track of tracks) {
            track['added_by'] = userID;
            this._validateTrackObject(track);
        }

        let queue = this._queue.get(guild.id);
        if (!queue) queue = this._getDefaultQueueObject(guild.id);

        queue.tracks = queue.tracks.concat(tracks);
        this._queue.set(guild.id, queue);

        this.emit('update', guild);
    }

    /**
     * @param guildID
     * @private
     */
    _initDefaultState(guildID)
    {
        let state = {
            passes: 2,
            seek: 0,
            volume: 1,
            increment_queue: true,
            loop: true,
            shuffle: true,
            stop: false,
        };
        this._state.set(guildID, state);

        return state;
    }

    /**
     *
     * @param id
     * @private
     */
    _incrementTimeout(id)
    {
        let timeout = this._timeouts.get(id) || {count: 0};
        timeout.count++;
        this._timeouts.set(id, timeout);
    }
    /**
     *
     * @param guildID
     * @private
     */
    _tryToIncrementQueue(guildID)
    {
        let queue = this._queue.get(guildID);
        let state = this._state.get(guildID);

        if (!queue) {
            throw 'Can\'t increment queue - map not initialized';
        }
        if (queue.position >= queue.tracks.length-1 && state.increment_queue === true) {
            queue.queue_end_reached = true;
        }
        else if (!state || state.increment_queue === true) {
            queue.position+=1;
        }

        state.increment_queue = true;

        this._state.set(guildID, state);
        this._queue.set(guildID, queue);
    }

    /**
     * @param guildID
     * @private
     */
    _resetQueuePosition(guildID)
    {
        let queue = this._queue.get(guildID);
        queue.position = 0;
        queue.queue_end_reached = false;
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
        if (!track) throw 'No track object passed';
        if (!track.title) throw 'Track object must specify track name [track.title]';
        if (!track.url) throw 'Track must specify stream url [track.url]';
        if (!track.source) throw 'Track must specify stream source [track.source]';
        if (!track.image) throw 'Track must specify stream image [track.image]';

        return true;
    }

    /**
     *
     * @param queue
     * @returns {*}
     * @private
     */
    _getTrack(queue)
    {
        let track = queue.tracks[queue.position];
        track['position'] = queue.position;
        track['total'] = queue.tracks.length;

        return track;
    }
};