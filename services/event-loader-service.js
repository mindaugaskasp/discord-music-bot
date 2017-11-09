const fs = require('fs');

module.exports = class EventLoaderService
{
    /**
     *
     * @param client
     * @param path
     * @param ignores
     */
    constructor(client, path = './events', ignores = [])
    {
        this.client = client;
        this.path = path;
        if (ignores.length > 0)  this.ignores = ignores;
        else this.ignores = ['event-loader.js', 'event.js']
    }

    /**
     * ARecursively reads path dir and loads events/attaches to client object
     * ignores specific files specified in this.ignores
     */
    load(path = null)
    {
        path = path || this.path;
        fs.readdirSync(path).forEach(file => {
            // if file do not end with . we assume it is a dir
            if (file.split('.').length === 1) {
                this.load(`${path}/${file}`)
            } else if (file.split('.')[1] === 'js' && this.ignores.indexOf(file.split('/')[0]) === -1) {
                this._attachEvent(`.${path}/${file}`)
            } else console.log(`Ignored ${file}`);
        });
    }

    /**
     *
     * @param filepath
     * @private
     */
    _attachEvent(filepath)
    {
        try {
            let event = require(filepath);
            if (!this.client['events']) this.client['events'] = [];
            this.client.events.push(new event(this.client).handle());
            console.log(`Event loaded successfully ${filepath}`);
        } catch (e) {
            console.log('Failed to load event', filepath);
        }
    }
};