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
        this.client.music.on('resume', async (text, guild) => {
            let channel = guild.channels.find('type', 'text');
            if (channel) (await channel.send(text)).delete(12000);
            else console.log(`No text channel found for guild ${guild.id}/${guild.name} to send resume text output`)
        });
    }

    /**
     * @param msg
     * @returns {Promise.<Message|Message[]>}
     */
    run(msg) {
        try {
            this.client.music.resume(msg.guild)
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.');
        }
    }
};