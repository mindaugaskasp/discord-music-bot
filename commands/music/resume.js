const { Command } = require('discord.js-commando');

module.exports = class ResumeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'resume',
            aliases: [],
            group: 'music',
            memberName: 'resume',
            description: 'Resumes music player if it has been paused',
            examples: ['resume'],
            guildOnly: true,
        });
        this.client.music.on('resume', async (text, guild, channel) => {
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
            this.client.music.resume(msg.guild, msg.channel)
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.');
        }
    }
};