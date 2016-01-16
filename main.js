var logger    = require('logfmt');
var http      = require('http');

var config    = require('./config');
var web       = require('./app/web');

process.on('SIGTERM', onShutdown);

logger.log({
    type: 'info',
    msg:  'starting server'
});

var server = http.createServer(web());
server.listen(config.port, onListen);

function onListen() {

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
        port: server.address().port
    });
}

function onShutdown() {
    logger.log({
        type: 'info',
        msg: 'shutting down'
    });
    server.close(function() {
        logger.log({ type: 'info', msg: 'exiting' });
        process.exit();
    });
}
