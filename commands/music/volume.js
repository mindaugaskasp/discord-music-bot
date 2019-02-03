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
        this.client.music.on('volume', async (text, guild, channel) => {
            (await channel.send(text)).delete(12000);
        });
    }

    /**
     * @param msg
     * @param args
     * @param fromPattern
     * @returns {Promise.<Message|Message[]>}
     */
    async run(msg, args, fromPattern) {
        try {
            this.client.music.setVolume(msg.guild, args.volume, msg.channel);
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};