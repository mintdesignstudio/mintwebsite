var path = require('path');

module.exports = {

    apiEndpoint:    process.env.API_ENDPOINT,
    accessToken:    process.env.ACCESS_TOKEN,
    clientId:       process.env.CLIENT_ID,
    clientSecret:   process.env.CLIENT_SECRET,

    port:           int(process.env.PORT),
    verbose:        bool(process.env.VERBOSE),

    public_dir:     path.join(__dirname, '/public'),
    prod_dir:       path.join(__dirname, '/production'),
    production:     process.env.NODE_ENV === 'production',
    development:    process.env.NODE_ENV === 'development',

    // Set website in Under Construction mode
    construction:   true,
};

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
