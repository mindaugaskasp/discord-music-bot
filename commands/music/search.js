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
        });
        this.youtube = new Youtube(client.config.youtube.token, client.config.youtube.base_url);
    }

    run(msg) {
        return msg.say('Hi, I will search music soon.');
    }
};