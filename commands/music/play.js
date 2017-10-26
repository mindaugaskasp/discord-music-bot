const { Command } = require('discord.js-commando');

module.exports = class PlayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'play',
            group: 'music',
            memberName: 'play',
            description: 'Plays loaded queue',
            examples: ['play'],
            guildOnly: true,
        });

    }

    run(msg) {
        return msg.say('Hi, I will play music soon.');
    }
};