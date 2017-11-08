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
        });

        try {
            this._initListeners();
        } catch (e) {
            console.log('Failed to initialize PlayCommand listeners', e);
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
            if (guild.voiceConnection) {
                if (playingMessage && playingMessage.deletable) playingMessage.delete();
                let channel = playingMessage ? playingMessage.channel : guild.channels.find('type', 'text');
                if (channel && embed !== null) playingMessage = (await channel.send('', {embed: embed}));
                else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display radio playing embed.`)
            }
        });

        this.client.moe_radio.on('stream', (text, guild) => {
            if (guild.voiceConnection) {
                let channel = guild.channels.find('type', 'text');
                if (channel && text) channel.send(text);
                else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display music playing embed.`)
            }
        });

        this.client.moe_radio.on('error', text => { throw text; });
    }
};