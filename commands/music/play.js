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
        this.client.music.on('playing', async (track, guild) => {
            // makes sure to delete previous playing embed message before sending a new one
            if (playingMessage) playingMessage.delete();
            let channel = guild.channels.find('type', 'text');
            if (channel) {
                playingMessage = (await channel.send('', {embed: this.client.music.getInfo(guild)}));
                this.client.music.savePlayerMessage(guild, playingMessage);
            }
            else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display music playing embed.`)
        });

        this.client.music.on('play', (text, guild) => {
            let channel = guild.channels.find('type', 'text');
            if (channel) channel.send(text);
            else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display music playing embed.`)
        });

        this.client.music.on('error', text => { throw text; });
    }

};