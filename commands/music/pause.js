const { Command } = require('discord.js-commando');

module.exports = class PauseCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'pause',
            aliases: [],
            group: 'music',
            memberName: 'pause',
            description: 'Pauses music player if it has been playing something',
            examples: ['pause'],
            guildOnly: true,
        });
        this.client.music.on('pause', async (text, guild, channel) => {
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
            this.client.music.pause(msg.guild, msg.channel)
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.');
        }
    }
};