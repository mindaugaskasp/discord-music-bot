const { Command } = require('discord.js-commando');

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
    }

    run(msg) {
        return msg.say('Hi, I will play music soon.');
    }
};