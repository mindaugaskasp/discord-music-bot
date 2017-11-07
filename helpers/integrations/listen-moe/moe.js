const axios = require('axios');
const Socket = require('./socket');

axios.defaults.baseURL = 'https://listen.moe/api/';
axios.defaults.headers.common['User-Agent'] = 'Music-Bot (v' + require('../../../package.json').version;

class ListenMo {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.token = null;
        this.socket = null;
    }

    _request(method, url, data = {}, requireAuth = false) {
        return new Promise((resolve, reject) => {
            if (requireAuth === true)
                data['authorization'] = this.token;
            axios({ method, url, data }).then(response => {
                if (response.data.success === false)
                    return reject(response.data.message);
                resolve(response.data);
            }).catch(error => {
                reject(error.response ? error.response.data : error.message);
            });
        });
    }

    authenticate(username, password) {
        return this._request('post', 'authenticate', {
            username: username || this.username,
            password: password || this.password
        }).then(data => {
            this.token = data.token;
            return data.token;
        });
    }

    getUser() {
        return this._request('get', 'user', {}, true);
    }

    getFavorites() {
        return this._request('get', 'user/favorties', {}, true);
    }

    favoriteSong(song) {
        return this._request('post', 'songs/favorite', { song }, true);
    }

    requestSong(song) {
        return this._request('post', 'songs/request', { song }, true);
    }

    openSocket(shouldAuth = false) {
        if (this.socket)
            return this.socket;

        this.socket = new Socket();
        this.socket.connect(shouldAuth ? this.token : null);
        return this.socket;
    }
}

module.exports = ListenMo;