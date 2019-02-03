const { Command } = require('discord.js-commando');

module.exports = class ShuffleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'shuffle',
            aliases: ['mix'],
            group: 'music',
            memberName: 'shuffle',
            description: 'Shuffles music player tracks',
            examples: ['shuffle'],
            guildOnly: true,
        });
        this.client.music.on('shuffle', async (text, guild, channel) => {
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
            this.client.music.shuffle(msg.guild, msg.channel);
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};