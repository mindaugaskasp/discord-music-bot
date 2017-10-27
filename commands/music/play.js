const { Command } = require('discord.js-commando');
const Discord = require('discord.js');

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
     * @returns {Promise.<Message|Message[]>}
     */
    run(msg) {
        try {
            this.client.music.play(msg.guild);
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }

    _initListeners()
    {
        let playingMessage = null;
        this.client.music.on('playing', (track, guild) => {
            // makes sure to delete previous playing embed message before sending a new one
            if (playingMessage) playingMessage.delete();
            let channel = guild.channels.find('type', 'text');
            if (channel) playingMessage = channel.send('', {embed: this._getPlayingEmbed(track)});
            else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display music playing embed.`)
        });

        this.client.music.on('info', (text, guild) => {
            let channel = guild.channels.find('type', 'text');
            if (channel) channel.send(text);
            else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display music playing embed.`)
        });

        this.client.music.on('error', text => { throw text; });
    }

    /**
     *
     * @param track
     * @private
     */
    _getPlayingEmbed(track)
    {
        let embed = new Discord.RichEmbed();
        embed
            .setAuthor(`Playing - 🎵 ${track.title} 🎵`, track.image, track.url)
            .setColor('RANDOM')
            .addField('Song Number', `${track.position+1} / ${track.total}`, true)
            .addField('Source', `${track.source}`, true)
            .setTimestamp();

        return embed;
    }

};