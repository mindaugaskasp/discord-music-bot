const { Command } = require('discord.js-commando');
const Helper = require('../../helper');

module.exports = class ViewCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'view',
            aliases: ['view', 'list', 'queue'],
            group: 'music',
            memberName: 'view',
            description: 'Views Music Queue tracks',
            examples: ['view', 'list', 'queue'],
            guildOnly: true,
            args: [{
                key: 'page',
                prompt: 'Enter page number',
                type: 'integer',
                default: 1
            }],
        });

    }

    /**
     *
     * @param msg
     * @param args
     * @param fromPattern
     * @returns {Promise.<*>}
     */
    async run(msg, args, fromPattern) {
        try {
            let list = this.client.music.getMusicQueue(msg.guild);
            if (!list || list.length === 0) {
                return (await msg.say('Music queue is empty. Search for some songs first.')).delete(1200);
            }
            else {
                return (await msg.say( `Guild - ${msg.guild.name} - Music Queue List\n`+ Helper.getPaginatedList(list, args.page), {code: 'python', split: true})).delete(12000);
            }
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};