var logger    = require('logfmt');
var http      = require('http');

var config    = require('./config');
var app       = require('./app/app');
var web       = require('./app/web');

process.on('SIGTERM', onShutdown);

logger.log({
    type:           'info',
    msg:            'starting server'
});

var app_instance = app(config);
var server = http.createServer(web(app_instance, config));

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
