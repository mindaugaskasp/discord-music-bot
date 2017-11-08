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
            clientPermissions: ['CONNECT'],
            userPermissions: ['CONNECT'],
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
            else {
                if (user.voiceChannel.joinable) user.voiceChannel.join().then(async (connection) => (await msg.say(`Joined Voice Channel - \`${connection.channel.name}\``)).delete(12000));
                else return msg.say(`I can't join channel ${user.voiceChannel.name}. Missing permissions.`)
            }
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
};