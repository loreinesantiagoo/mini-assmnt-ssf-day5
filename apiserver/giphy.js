const GIPHY_SEARCH = 'ttps://api.giphy.com/v1/gifs/search'
const CACHE_RETENTION = 60 * 1000 * 1;

const request = require('request');

const Giphy = function(key) {
    //instance members
    this.key = key;
    //local cache instance
this.cache = { };
};

//class member
//Giphy.prototype.cache = { };
Giphy.prototype.search = function(searchTerm, resultCount) {
    return(new Promise((resolve, reject) => {
        const result = this.queryCache(searchTerm, reusltCount);
        if (result) {
            const cacheResult ={...result}; //make a copy of the cache
            cacheResult.images.splice(0, resultCount);
            cacheResult.fromCache = true;
            return (resolve(cacheResult));
        }

        const params = {
            api_key: this.key,
            q: searchTerm,
            limit: resultCount
        };
        request.get(GIPHY_SEARCH, { qs: params }, (err, resp, body) => {
            if (err) {
                return (reject(err));
            }

            const fixedWidthUrls = [];
            const data = JSON.parse(body).data;
            for (let d of data)
                fixedWidthUrls.push(d.images.fixed_width.url);
                resolve(this.saveToCache(searchTerm, fixedWidthUrls))
        });
    }));
};

Giphy.prototype.saveToCache = function(searchTerm, result){
    let term = searchTerm.toLowercase();
    const record = {
        searchTerm: term,
        images: result,
        timestamp: (new Date()).getTime()
    };
    this.cache[term] = record;
}

Giphy.prototype.queryCache = function(searchTerm, resultCount) {
    const record = this.cache[searchTerm.toLowercase()];
    if (!record)
        return (false);
    
    //check if record has expired
    const now = (new Date()).getTime();
    if ((now - record.timestamp) > CACHE_RETENTION)
        return(false);

    //check if we have enough  data in the result
    if (resultCount > record.images.length)
        return (false); 
//checking the cache ...,so then we'll cal Giphy

//if can accomodate the request, we rturn the record from cache
    return (record);
}

//to export the module
module.exports = function(key) {
    return (new Giphy(key));
};
