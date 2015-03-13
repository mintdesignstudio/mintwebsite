var path    = require('path');
var config  = require('./config.json');

module.exports = {
    apiEndpoint:    process.env.API_ENDPOINT,
    accessToken:    process.env.ACCESS_TOKEN,
    clientId:       process.env.CLIENT_ID,
    clientSecret:   process.env.CLIENT_SECRET,

    port:           int(process.env.PORT),
    verbose:        bool(process.env.VERBOSE),

    production:     process.env.NODE_ENV === 'production',
    development:    process.env.NODE_ENV === 'development',

    // Set website in Under Construction mode
    construction:   config.construction,
    routes:         config.routes
};

module.exports.dir = function(directory) {
    return __dirname +
           (this.production ? '/production' : '') +
           config.dir[directory];
}

module.exports.url = function(type) {
    console.log('NODE_ENV', process.env.NODE_ENV);
    return this.production ?
           config.url[type] :
           'http://localhost:'+this.port;
}

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
