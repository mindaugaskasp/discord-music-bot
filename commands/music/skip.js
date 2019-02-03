const { Command } = require('discord.js-commando');

module.exports = class SkipCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'skip',
            aliases: ['next'],
            group: 'music',
            memberName: 'skip',
            description: 'Skips current track playback',
            examples: ['skip', 'next'],
            guildOnly: true,
        });
        this.client.music.on('skip', async (text, guild, channel) => {
           (await channel.send(text)).delete(12000);
        });
    }

    /**
     *
     * @param msg
     * @param args
     * @param fromPattern
     * @returns {Promise.<Message|Message[]>}
     */
    run(msg, args, fromPattern) {
        try {
            this.client.music.skip(msg.guild, msg.channel)
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.');
        }
    }
};