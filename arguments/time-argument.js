const ArgumentType = require('discord.js-commando').ArgumentType;

class TimeArgumentType extends ArgumentType
{
    /**
     * Time argument separator
     * @returns {string}
     * @constructor
     */
    static SEP()
    {
        return ':'
    }

    /**
     * @param client
     */
    constructor(client)
    {
        super(client, 'time');
    }

    /**
     * @param value string
     * @param msg CommandMessage
     * @param arg
     * @returns {*}
     */
    parse(value, msg, arg)
    {
        let split = msg.argString.split(TimeArgumentType.SEP());
        let hrs = 0, mins = 0, secs = 0;

        if (split.length === 3) {
            hrs = Math.abs(this._parseInt(split[0]));
            mins = Math.abs(this._parseInt(split[1]));
            secs = Math.abs(this._parseInt(split[2]));
        } else {
            mins = Math.abs(this._parseInt(split[0]));
            secs = Math.abs(this._parseInt(split[1]));
        }

        return   {
            hours: hrs,
            minutes: mins,
            seconds: secs,
            total : {
                seconds: hrs * 60 * 60 + mins * 60 + secs
            },
            text: `${hrs < 10 ? '0' : ''}${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
        };
    }

    /**
     * Validates passed argument
     * @param value
     * @param msg
     * @param arg
     * @returns {*}
     */
    validate(value, msg, arg)
    {
        let validationText = `Incorrect time format provided! Expected format 4:30, 04:30, 1:20:30 or similar [hh:mm:ss]. Received: ${value}`;

        let split = msg.argString.split(TimeArgumentType.SEP());
        if (split.length === 0 || split.length > 3) {
            return validationText;
        }

        let parsedHrs, parsedMin, parsedSec;
        if (split.length === 3) {
            parsedHrs = this._parseInt(split[0]);
            parsedMin = this._parseInt(split[1]);
            parsedSec = this._parseInt(split[2]);
        } else {
            parsedMin = this._parseInt(split[0]);
            parsedSec = this._parseInt(split[1]);
        }

        if (!parsedMin || !parsedSec || (split.length === 3 && !parsedHrs)) {
            return validationText;
        }

        return true;
    }

    /**
     * @param str
     * @returns {*}
     * @private
     */
    _parseInt(str)
    {
        let isValid = (/([0-9]{1,2})$/g).test(str);
        if (isValid) return Number(str);

        return null;
    }

}

module.exports = TimeArgumentType;