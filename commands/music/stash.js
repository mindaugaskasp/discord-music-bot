const { Command } = require('discord.js-commando');
const Util = require('discord-helpers/util');

module.exports = class StashCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stash',
            aliases: [],
            group: 'music',
            memberName: 'stash',
            description: 'Views Music search stash',
            examples: ['stash'],
            args: [{
                key: 'page',
                prompt: 'Enter page number',
                type: 'integer',
                default: 1
            }],
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
            else return (await msg.say( `Guild - ${msg.guild.name} - Music Search Stash List\n`+ Util.getPaginatedList(list, args.page), {code: 'python', split: true})).delete(12000);
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};