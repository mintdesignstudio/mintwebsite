var app     = require('./app/app');
var config  = require('./config');
var logger  = require('logfmt');

var instance = app.init();

process.on('SIGTERM', function() {
    logger.log({
        type: 'info',
        msg:  'shutting down'
    });
    instance.close(function() {
        logger.log({ type: 'info', msg: 'exiting' });
        process.exit();
    });
});

logger.log({
    type: 'info',
    msg:  'starting server'
});

instance.listen(config.port, function() {
    if (typeof process.env.API_ENDPOINT === 'undefined') {
        logger.log({
            type: 'error',
            msg:  'Missing environment variable API_ENDPOINT'
        });
    }
    if (typeof process.env.ACCESS_TOKEN === 'undefined') {
        logger.log({
            type: 'error',
            msg:  'Missing environment variable ACCESS_TOKEN'
        });
    }
    if (typeof process.env.CLIENT_ID === 'undefined') {
        logger.log({
            type: 'error',
            msg:  'Missing environment variable CLIENT_ID'
        });
    }
    if (typeof process.env.CLIENT_SECRET === 'undefined') {
        logger.log({
            type: 'error',
            msg:  'Missing environment variable CLIENT_SECRET'
        });
    }

    logger.log({
        type: 'info',
        msg: 'listening',
        port: config.port
    });
});
