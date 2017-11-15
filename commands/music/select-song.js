const { Command } = require('discord.js-commando');
const Youtube = require('discord-helpers/integrations/youtube');

/**
 * Command responsible for filtering out the songs saved in memory from one location to the other.
 * Usually searched records sre saved in stash (searches map) in music player object. This map gets filtered out in this command
 * and saved to the queue (_queue MAP) which can be played by music player by initiating play command.
 *
 * @type {module.SelectSongCommand}
 */
module.exports = class SelectSongCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'pick',
            aliases: ['select-song', 'select', 'take', 'choose'],
            group: 'music',
            memberName: 'pick',
            description: 'Picks song(s) should be added to player',
            examples: ['pick 1', 'pick 1,2', 'pick all'],
            guildOnly: true,
            args: [{
                key: 'selection',
                prompt: 'Enter song numbers you would like to add to queue',
                type: 'string'
            }],
        });
        this.youtube = new Youtube(client.config.youtube.token, client.config.youtube.base_url);
    }

    async run(msg, args) {
        try {
            if (this.client.music.getMusicQueue(msg.guild).length >= 500)
                return (await msg.say('Music player is full. Please remove some of the tracks.')).delete(12000);

            (await msg.say('Adding track(s) to music queue. Please be patient.')).delete(12000);

            let searches = this.client.music.searches.get(msg.guild.id);
            if (!searches) return (await msg.say('Please search for songs first. Search stash is empty!')).delete(12000);
            let addedToQueue = 0;

            if (args.selection.toLowerCase() === 'all') {
                this.client.music.loadTracks(searches, msg.guild, msg.author.id);
                addedToQueue = searches.length;
            } else {
                let selection = args.selection.match(/\d+/g);
                if (!selection) return (await msg.say(`Selection unrecognized: \`${args.selection.toLowerCase()}\`. Allowed: \`ALL\`, \`1\` - \`${searches.length}\``)).delete(15000);

                for (let index = 0; index < searches.length; index++)
                    for (let selectedIndex of selection)
                        if (parseInt(selectedIndex) === index+1) {
                            addedToQueue++;
                            this.client.music.loadTrack(searches[index], msg.guild);
                        }
            }

            return (await msg.say(`${addedToQueue} song(s) have been added to queue`)).delete(12000);

        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }

};