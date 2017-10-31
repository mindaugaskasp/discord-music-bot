const { Command } = require('discord.js-commando');

module.exports = class StashCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stash',
            aliases: [],
            group: 'music',
            memberName: 'stash',
            description: 'Views Music search stash',
            examples: ['stash'],
            guildOnly: true,
        });

    }

    /**
     * @param msg
     * @returns {Promise.<Message|Message[]>}
     */
    async run(msg) {
        try {
            let list = this.client.music.searches.get(msg.guild.id);
            if (!list || list.length === 0) return (await msg.say('Music stash is empty. Search for some songs first.')).delete(1200);
            else {
                let str = `Guild - ${msg.guild.name} - Search stash\n\n`;
                let counter = 1;
                for (let track of list) str += `${counter++}. ${track.title} \ ${track.url}\n`;
                return (await msg.say(str, {code: 'css', split: true})).delete(12000);
            }
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};