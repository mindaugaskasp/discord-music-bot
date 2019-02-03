module.exports = class Helper
{
    /**
     * Constructs a paginated string list out of array
     * @param list
     * @param page
     * @param perPage
     * @returns string|null
     */
    static getPaginatedList(list, page = 1, perPage = 10)
    {
        let sep = '\n';
        let pages = Math.ceil(list.length / perPage);
        if (page > pages || list.length === 0) return 'Nothing here....';

        // slices array by paginated entries, starting at (perPage) records per page,
        // first arg decides the first index of sliced array
        let startIndex = (page * perPage) <= perPage ?  0 : ((page-1) * perPage);
        let endIndex = startIndex + perPage < list.length ? startIndex + perPage : list.length;
        let queue = list.slice(startIndex, endIndex);
        let str = `Total: ${list.length}, Current page: ${page}, last page: ${pages}`+sep;

        let count = startIndex;
        for (let item of queue) {
            str += `${++count}. ${item.title.replace('\'', '')} [${item.url}]\n`;
        }

        return str + '\n';
    }

    /**
     * @param message
     * @param append
     * @param maxLen
     * @returns {Promise.<void>}
     */
    static async constructLoadingMessage(message, append = ".", maxLen = 150)
    {
        try {
            message =  await message.channel.fetchMessage(message.id);
            if (message && message.deletable) {
                let content = message.content + append;
                if (content.length >= maxLen) content = append;

                if (message.editable) {
                    message = (await message.edit(content));
                    setTimeout(async function(){
                        await Helper.constructLoadingMessage(message, append, maxLen);
                    }, 1100);
                }
            }
            return message;
        } catch (error) {
            return message;
        }
    }
};