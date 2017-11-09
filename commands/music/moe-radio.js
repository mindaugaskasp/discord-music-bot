const { Command } = require('discord.js-commando');

module.exports = class MoeRadioCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'moe-radio',
            aliases: ['moe', 'listen-moe'],
            group: 'music',
            memberName: 'moe-radio',
            description: 'Plays Listen.moe JPOP radio stream',
            examples: ['moe', 'listen-moe', 'moe-radio'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 5
            },
            clientPermissions: ['CONNECT', 'SPEAK'],
        });

        try {
            this._initListeners();
        } catch (e) {
            console.log('Failed to initialize MoeRadioCommand listeners', e);
        }
    }

    /**
     * @param msg
     * @returns {Promise.<Message|Message[]>}
     */
    async run(msg) {
        try {
            if (! msg.guild.voiceConnection) return msg.say('I am not in voice channel yet to play radio.');
            this.client.moe_radio.stream(msg.guild);
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }

    _initListeners()
    {
        let playingMessage = null;
        this.client.moe_radio.on('streaming', async (embed, guild) => {
            let channel = playingMessage && playingMessage.channel ? guild.channels.get(playingMessage.channel.id) : guild.channels.find('type', 'text');
            if (playingMessage && playingMessage.deletable) playingMessage.delete();
            if (channel && embed !== null) {
                playingMessage = (await channel.send('', {embed: embed}));
                this.client.moe_radio.savePlayerMessage(guild, playingMessage);
            } else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display radio playing embed.`)
        });

        this.client.moe_radio.on('stream', async (text, guild) => {
            let channel = guild.channels.find('type', 'text');
            if (channel && text) (await channel.send(text)).delete(20000);
            else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display radio stream text.`)
        });

        this.client.moe_radio.on('error', text => { throw text; });
    }
};