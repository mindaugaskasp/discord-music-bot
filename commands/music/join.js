const { Command } = require('discord.js-commando');

module.exports = class JoinCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'join',
            aliases: ['join-channel', 'channel'],
            group: 'music',
            memberName: 'join',
            description: 'Joins user active voice channel',
            examples: ['join'],
            guildOnly: true,
        });

    }

    /**
     *
     * @param msg
     * @returns {Promise.<Message|Message[]>}
     */
    run(msg) {
        try {
            let user = msg.member;
            if (!user.voiceChannel) return msg.say('You must join channel first before using this command');
            else user.voiceChannel.join().then((connection) => msg.say(`Joined Voice Channel - \`${connection.channel.name}\``));

        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};