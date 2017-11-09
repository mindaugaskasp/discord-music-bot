const { Command } = require('discord.js-commando');
const Youtube = require('../../helpers/integrations/youtube');
const Util = require('../../helpers/util');

/**
 * Command responsible for retrieving tracks via youtube data API and saving to memory
 * @type {module.SearchCommand}
 */
module.exports = class SearchCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'search',
            aliases: ['get', 'retrieve', 'fetch', 'look', 'find'],
            group: 'music',
            memberName: 'search',
            description: 'Searches for a track in youtube by link or text query',
            examples: ['search daft punk get lucky', 'search https://www.youtube.com/watch?v=pSwUztIvlBc'],
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
        let loaderMsg;
        try {
            let indicatorMsg = (await msg.say('Searching for music. Please be patient.'));
            loaderMsg = await Util.constructLoadingMessage(await msg.say(':hourglass_flowing_sand:'), ':hourglass_flowing_sand:');

            let results = await this.youtube.search(args.query);
            indicatorMsg.delete();
            loaderMsg.delete();

            if (results.length > 50 || results.length === 1) {
                this.client.music.loadTracks(results, msg.guild, msg.author.id);
                return (await msg.say(`${results.length} track(s) have been added to the music queue.`)).delete(12000)
            } else {
                this.client.music.searches.set(msg.guild.id, results);
                return (await msg.say('Select song(s) to be added to music queue by using command `select` and specifying song number(s) as an argument. E.g. `select 1,2` or `select all`.\n'+
                    Util.getPaginatedList(results, args.page) + '\nTo view more search results use command stash', {code: 'python', split: true})).delete(12000);
            }
        } catch (e) {
            if (loaderMsg && typeof loaderMsg.delete === 'function') loaderMsg.delete();
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};