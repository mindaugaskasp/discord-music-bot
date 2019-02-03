const { Command } = require('discord.js-commando');

/**
 * Command responsible for playing whatever is saved in memory for given guild
 * @type {module.PlayCommand}
 */
module.exports = class PlayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'play',
            aliases: ['listen', 'stream'],
            group: 'music',
            memberName: 'play',
            description: 'Plays loaded queue',
            examples: ['play'],
            guildOnly: true,
            clientPermissions: ['CONNECT', 'SPEAK'],
        });

        try {
            this._initListeners();
        } catch (e) {
            console.log('Failed to initialize PlayCommand listeners', e);
        }
    }

    /**
     *
     * @param msg
     * @param args
     * @param fromPattern
     * @returns {Promise<Message|Message[]>}
     */
    run(msg, args, fromPattern) {
        try {
            this.client.music.play(msg.guild, msg.channel);
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }

    /**
     * inits player events
     * @private
     */
    _initListeners()
    {
        this.client.music.on('playing', async (track, guild, channel) => {
            let playingMessage = this.client.music.messages.get(guild.id);
            if (playingMessage && playingMessage.deletable) {
                playingMessage.delete();
            }
            this.client.music.savePlayerMessage(guild, (await channel.send('', {embed: this.client.music.getInfo(guild)})));
        });

        this.client.music.on('play', (text, guild, channel) => {
            channel.send(text);
        });

        this.client.music.on('error', text => { throw text; });
    }
};