const { Command } = require('discord.js-commando');

module.exports = class StopCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stop',
            aliases: [],
            group: 'music',
            memberName: 'stop',
            description: 'Stops music player',
            examples: ['stop'],
            guildOnly: true,
        });
        this.client.music.on('stop', async (text, guild, channel) => {
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
            this.client.music.stop(msg.guild, msg.channel)
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.');
        }
    }
};