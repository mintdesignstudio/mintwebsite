var path = require('path');

module.exports = {

    apiEndpoint:    '',
    accessToken:    '',
    clientId:       '',
    clientSecret:   '',

    port:           int(process.env.PORT),
    verbose:        bool(process.env.VERBOSE),

    public_dir:     path.join(__dirname, '/public'),
    views_dir:      path.join(__dirname, '/views'),
    production:     process.env.NODE_ENV === 'production',
    development:    process.env.NODE_ENV === 'development',

    // Links resolution rules
    linkResolver: function(ctx, doc) {
        if (doc.isBroken) {
            return false;
        }
        return '/documents/' + doc.id + '/' + doc.slug + (ctx.maybeRef ? '?ref=' + ctx.maybeRef : '');
    },

    // What to do in the event of an error from prismic.io
    onPrismicError: function(err, req, res) {
        res.send(500, 'Error 500: ' + err.message);
    }
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
