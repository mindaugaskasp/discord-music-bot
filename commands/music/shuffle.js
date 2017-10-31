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
        this.client.music.on('shuffle', async (text, guild) => {
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
            this.client.music.shuffle(msg.guild, 'manual');
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};