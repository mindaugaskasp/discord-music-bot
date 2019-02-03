const { Command } = require('discord.js-commando');

module.exports = class SeekCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'seek',
            aliases: [''],
            group: 'music',
            memberName: 'seek',
            description: 'Seeks music player to specified time',
            examples: ['seek 1:30', 'seek 0:30'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 5
            },
            args: [
                {
                    key: 'time',
                    prompt: 'Enter seek time. E.g. 1:30 or 0:30',
                    type: 'time',
                }
            ],
        });
        this.client.music.on('seek', async (text, guild, channel) => {
            (await channel.send(text)).delete(12000);
        });
    }

    /**
     * @param msg
     * @param args
     * @param fromPattern
     * @returns {Promise<Message|Message[]>}
     */
    run(msg, args, fromPattern) {
        try {
            this.client.music.seek(msg.guild, args.time.total.seconds, args.time.text, msg.channel)
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.');
        }
    }
};