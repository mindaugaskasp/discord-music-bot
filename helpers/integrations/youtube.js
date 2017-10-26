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
            if (response.statusCode === 200) {
                let formatted = [];
                let sliced = response.body.items.slice(0, results);
                for (let track of sliced) {
                    formatted.push(
                        {
                            title: '',
                            author: '',
                            description: '',
                            url: `${this.base_url}/watch?v=${track.contentDetails.videoId}`
                        }
                    )
                }
                deferred.resolve(formatted);
            }
            else deferred.reject(response);
        });

        return deferred.promise;
    }

};