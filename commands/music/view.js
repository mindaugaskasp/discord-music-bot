const { Command } = require('discord.js-commando');

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
        });

    }

    /**
     *
     * @param msg
     * @returns {Promise.<Message|Message[]>}
     */
    async run(msg) {
        try {
            let list = this.client.music.getMusicQueue(msg.guild);
            if (!list || list.length === 0) return (await msg.say('Music queue is empty. Search for some songs first.')).delete(1200);
            else {
                let str = `Guild - ${msg.guild.name} - Music List\n\n`;
                let counter = 1;
                for (let track of list)
                    str += `${counter++}. ${track.title} \ ${track.url}\n`;
                return (await msg.say(str, {code: 'python', split: true})).delete(12000);
            }
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};