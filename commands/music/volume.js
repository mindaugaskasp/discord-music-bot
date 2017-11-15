const { Command } = require('discord.js-commando');

module.exports = class VolumeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'volume',
            aliases: ['sound'],
            group: 'music',
            memberName: 'volume',
            description: 'Sets music player volume',
            examples: ['volume', 'volume 50'],
            guildOnly: true,
            args: [
                {
                    key: 'volume',
                    prompt: 'Enter volume value between 0 - 100',
                    type: 'integer',
                    validate: volume => {
                        return volume <= 100 && volume >= 0;
                    }
                }
            ],
        });
        this.client.music.on('volume', async (text, guild) => {
            let channel = guild.channels.find('type', 'text');
            if (channel) (await channel.send(text)).delete(12000);
            else console.log(`No text channel found for guild ${guild.id}/${guild.name} to send event message.`)
        });
    }

    /**
     * @param msg
     * @returns {Promise.<Message|Message[]>}
     */
    async run(msg, args) {
        try {
            this.client.music.setVolume(msg.guild, args.volume);
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};