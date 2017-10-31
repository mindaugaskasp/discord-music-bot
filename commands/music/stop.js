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
        this.client.music.on('stop', async (text, guild) => {
            let channel = guild.channels.find('type', 'text');
            if (channel) (await channel.send(text)).delete(12000);
            else console.log(`No text channel found for guild ${guild.id}/${guild.name} to send event message.`)
        });
    }

    /**
     *
     * @param msg
     * @returns {Promise.<Message|Message[]>}
     */
    run(msg) {
        try {
            this.client.music.stop(msg.guild)
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.');
        }
    }
};