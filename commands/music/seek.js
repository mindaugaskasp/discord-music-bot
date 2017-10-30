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
        this.client.music.on('seek', async (text, guild) => {
            let channel = guild.channels.find('type', 'text');
            if (channel) (await channel.send(text)).delete(12000);
            else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display music playing embed.`)
        });
    }

    /**
     *
     * @param msg
     * @returns {Promise.<Message|Message[]>}
     */
    run(msg, args) {
        try {
            this.client.music.seek(msg.guild, args.time.total.seconds, args.time.text)
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.');
        }
    }
};