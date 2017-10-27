const { Command } = require('discord.js-commando');
const Youtube = require('../../helpers/integrations/youtube');

/**
 * Command responsible for retrieving tracks via youtube data API and saving to memory
 * @type {module.SearchCommand}
 */
module.exports = class SearchCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'search',
            aliases: ['get', 'retrieve', 'fetch'],
            group: 'music',
            memberName: 'search',
            description: 'Searches for a track in youtube by link or text query',
            examples: ['search daft punk get lucky'],
            throttling: {
                usages: 2,
                duration: 5
            },
            guildOnly: true,
            args: [{
                key: 'query',
                prompt: 'Youtube URL or a song search text. E.g. `daft punk get lucky` or `https://www.youtube.com?v=qODMVRDehXE`',
                type: 'string'
            }],
        });
        this.youtube = new Youtube(client.config.youtube.token, client.config.youtube.base_url);
    }

    /**
     *
     * @param msg
     * @param args
     * @returns {Promise.<*>}
     */
    async run(msg, args) {
        try {
            let results = await this.youtube.search(args.query);
            (await msg.say(`${results.length} result(s) have been found!`)).delete(10000);
            this.client.music.searches.set(msg.guild.id, results);

            let text = 'Select song(s) to be added from by using command `select` and specifying song number(s) as an argument. E.g. select 1,2 or just select, or select all 1.\n';
            let counter = 1;
            for (let track of results) text += `${counter++}. ${track.title} - ${track.url}\n`
            return (await msg.say(text, {code: 'python'})).delete(60000);

        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};