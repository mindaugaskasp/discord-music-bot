const { Command } = require('discord.js-commando');
const Youtube = require('discord-helpers/integrations/youtube');
const Util = require('discord-helpers/util');

/**
 * Command responsible for retrieving tracks via youtube data API and saving to memory
 * @type {module.SearchCommand}
 */
module.exports = class GetCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'get',
            aliases: ['search', 'retrieve', 'fetch', 'look', 'find'],
            group: 'music',
            memberName: 'search',
            description: 'Looks for a song in youtube by link or search text',
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

            if (results.length === 0) return (await msg.say(`Couldnt find any songs for query: \`${args.query}\`. Please make sure the link is correct and try again.`)).delete(5000);
            
            if (results.length > 50 || results.length === 1) {
                this.client.music.loadTracks(results, msg.guild, msg.author.id);
                return (await msg.say(`${results.length} track(s) have been added to the music queue.`)).delete(12000)
            } else {
                this.client.music.searches.set(msg.guild.id, results);
                (await msg.say('Select song(s) to be added to music queue by using command `pick` and specifying song number(s) as an argument. E.g. `pick 1,2` or `pick all`.')).delete(15000);
                (await msg.say(Util.getPaginatedList(results, args.page) + '\nTo view more search results use command stash', {code: 'python', split: true})).delete(15000);
            }
        } catch (e) {
            if (loaderMsg && typeof loaderMsg.delete === 'function') loaderMsg.delete();
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};