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
        this.client.music.on('playing', async (track, guild) => {
            if (guild.voiceConnection) {
                let playingMessage = this.client.music.messages.get(guild.id);
                if (playingMessage && playingMessage.deletable) playingMessage.delete();
                let channel = guild.channels.find('type', 'text');
                if (channel) this.client.music.savePlayerMessage(guild, (await channel.send('', {embed: this.client.music.getInfo(guild)})));
                else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display music playing embed.`)
            }
        });

        this.client.music.on('play', (text, guild) => {
            if (guild.voiceConnection) {
                let channel = guild.channels.find('type', 'text');
                if (channel) channel.send(text);
                else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display music playing embed.`)
            }
        });

        this.client.music.on('error', text => { throw text; });
    }
};