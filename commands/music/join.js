const { Command } = require('discord.js-commando');

module.exports = class JoinCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'join',
            aliases: ['join-channel', 'channel', 'voice'],
            group: 'music',
            memberName: 'join',
            description: 'Joins user active voice channel',
            examples: ['join'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 5
            },
        });

    }

    /**
     * @param msg
     * @returns {Promise.<Message|Message[]>}
     */
    async run(msg) {
        try {
            let user = msg.member;
            if (!user.voiceChannel) return (await msg.say('You must join voice channel first before using this command')).delete(1200);
            else user.voiceChannel.join().then(async (connection) => (await msg.say(`Joined Voice Channel - \`${connection.channel.name}\``)).delete(12000));

        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};