var config = require('./config.json');

module.exports = {
    apiEndpoint:    process.env.API_ENDPOINT,
    accessToken:    process.env.ACCESS_TOKEN,
    clientId:       process.env.CLIENT_ID,
    clientSecret:   process.env.CLIENT_SECRET,

    port:           int(process.env.PORT || 5000),
    verbose:        bool(process.env.VERBOSE),

    production:     process.env.NODE_ENV === 'production',
    development:    process.env.NODE_ENV === 'development',

    routes:         config.routes
};

module.exports.dir = function(directory) {
    return __dirname
        + (this.production ? '/production' : '')
        + config.dir[directory];
};

module.exports.pageUrl = function(req) {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
};

module.exports.siteUrl = function(req) {
    return req.protocol + '://' + req.get('host') + '/';
};

// module.exports.url = function(type) {
//     return this.production
//         ? config.url[type]
//         : 'http://localhost:' + this.port;
// }

function bool(str) {
    if (str == void 0) return false;
    return str.toLowerCase() === 'true';
}

function int(str) {
    if (!str) return 0;
    return parseInt(str, 10);
}

function float(str) {
    if (!str) return 0;
    return parseFloat(str, 10);
}
