const logger       = require('heroku-logger');
const config       = require('../../config.js');

module.exports = function(app) {
    if (config.production) {
        // redirect to https and non-www
        app.get('*', function(req, res, next) {
            let host = req.header('host');

            if (host.substr(0, 9) === 'localhost') {
                next();
                return;
            }

            logger.info('host: ' + host);
            logger.info('x-forwarder-proto: ' + req.headers['x-forwarded-proto']);
            logger.info('match www: ' + host.match(/^www\..*/i));

            let hasWWW = host.match(/^www\..*/i) !== null;

            logger.info('has www: ' + hasWWW);

            if (req.headers['x-forwarded-proto'] === 'https' && !hasWWW) {
                logger.info('no redirect necessary');
                next();
                return;
            }

            let domain = hasWWW ? host.substr(4) : host;

            logger.info('redirect to: https://' + domain + req.url);
            res.redirect(301, 'https://' + domain + req.url);
        });
    }
}
