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

        this.client.music.on('jump', async (text, guild, channel) => {
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
            this.client.music.jump(msg.guild, args.number);
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.');
        }
    }
};