const { Command } = require('discord.js-commando');
const Youtube = require('../../helpers/integrations/youtube');

module.exports = class SearchCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'search',
            group: 'music',
            memberName: 'search',
            description: 'Searches for a track in youtube by link or text query',
            examples: ['search daft punk get lucky'],
            guildOnly: true,
            args: [{
                key: 'query',
                prompt: 'Youtube URL or a song search text. E.g. `daft punk get lucky` or `https://www.youtube.com?v=qODMVRDehXE`',
                type: 'string'
            }],
        });
        this.youtube = new Youtube(client.config.youtube.token, client.config.youtube.base_url);
    }

    async run(msg) {
        try {
            let results = await this.youtube.search(args.query);
            (await msg.say(`${resulsts.length} result(s) have been found!`)).delete(100000)

        } catch (e) {
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};