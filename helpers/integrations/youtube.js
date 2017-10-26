const request = require('superagent');
const promise = require('promised-io/promise');

module.exports = class Youtube
{
    constructor(token, base_url)
    {
        this.token = token;
        this.base_url = base_url;
    }

    async search(query, results = 50)
    {
        let deferred = promise.defer();

        let requestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet,contentDetails&q=${escape(query)}&key=${this.token}&type=video`;
        request(requestUrl, async (error, response) => {
            if (response.statusCode === 200) deferred.resolve(response.body.items.slice(0, results));
            else deferred.reject(response);
        });

        return deferred.promise;
    }

};