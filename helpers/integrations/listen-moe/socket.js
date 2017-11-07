const EventEmitter = require('events').EventEmitter;
const WebSocket = require('ws');

class Socket extends EventEmitter {
    constructor()
    {
        super();
        this.ws = null;
        this.authenticated = false;
        this._reconnectTime = 2000;
        this.token = null;
        this.info = {};
    }

    connect(token)
    {
        if (token)
            this.token = token;

        if (this.ws !== null)
            this.ws.removeAllListeners();

        this.ws = new WebSocket('https://listen.moe/api/v2/socket');

        this.ws.on('open', () => {
            this.emit('open');
            this._reconnectTime = 2000;
            if (this.token)
                this.authenticate(this.token);
        });

        this.ws.on('message', data => {
            try {
                if (data) {
                    this.info = JSON.parse(data);
                    this.emit('update', this.info);
                }
            } catch (e) {
                this.emit('updateError', e);
            }
        });

        this.ws.on('error', error => {
            this.emit('error', error);
        });

        this.ws.on('close', () => {
            this.emit('close');
            this.authenticated = false;
            setTimeout(() => { this.connect(this.token); }, this._reconnectTime);
            if (this._reconnectTime < 120000)
                this._reconnectTime += 500;
        });
    }


    authenticate(token) {
        if (this.ws) {
            this.ws.send(JSON.stringify({ token: token || this.token }));
            this.authenticated = true;
        }
    }

    update() {
        if (this.ws)
            this.ws.send('update');
    }
}

module.exports = Socket;