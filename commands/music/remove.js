const { Command } = require('discord.js-commando');

module.exports = class RemoveCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'remove',
            aliases: ['delete', 'rm', 'del', 'dl'],
            group: 'music',
            memberName: 'remove',
            description: 'Removes track(s) from music player',
            examples: ['stop'],
            guildOnly: true,
            args:[
                {
                    key: 'number',
                    prompt: 'Enter valid track number in the queue. Enter `0` if you want to delete `ALL` tracks in music queue.',
                    type: 'integer',
                }
            ]
        });
        this.client.music.on('remove', async (text, guild, channel) => {
            (await channel.send(text)).delete(12000);
        });
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
            this.client.music.removeTrack(msg.guild, args.number, msg.channel)
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.');
        }
    }
};