const { Command } = require('discord.js-commando');

module.exports = class JumpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'jump',
            aliases: [],
            group: 'music',
            memberName: 'jump',
            description: 'Jumps player to specific song',
            examples: ['jump'],
            guildOnly: true,
            args:[
                {
                    key: 'number',
                    prompt: 'Enter a valid track number, view music queue for track list',
                    type: 'integer',
                    validate: number => {
                        return number >= 1;
                    }
                }
            ]
        });

        this.client.music.on('jump', async (text, guild) => {
            let channel = guild.channels.find('type', 'text');
            if (channel) (await channel.send(text)).delete(12000);
            else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display music playing embed.`)
        });
    }

    /**
     *
     * @param msg
     * @param args
     * @returns {Promise.<Message|Message[]>}
     */
    run(msg, args) {
        try {
            this.client.music.jump(msg.guild, args.number);
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.');
        }
    }
};