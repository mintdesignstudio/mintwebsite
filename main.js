var logger    = require('logfmt');
var http      = require('http');

var config    = require('./config');
var web       = require('./app/web');

process.on('SIGTERM', onShutdown);

logger.log({
    type:           'info',
    msg:            'starting server'
});

var server = http.createServer(web());
server.listen(config.port, onListen);

function onListen() {
    logger.log({ type: 'info', msg: 'listening', port: server.address().port });
}

function onShutdown() {
    logger.log({ type: 'info', msg: 'shutting down' });
    server.close(function() {
        logger.log({ type: 'info', msg: 'exiting' });
        process.exit();
    });
}
