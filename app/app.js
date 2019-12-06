var express         = require('express'),
    favicon         = require('serve-favicon'),
    busBoy          = require('express-busboy'),
    robots          = require('express-robots'),
    cookieParser    = require('cookie-parser'),
    methodOverride  = require('method-override'),
    errorHandler    = require('errorhandler'),
    http            = require('http'),
    path            = require('path'),
    helmet          = require('helmet'),
    compress        = require('compression'),
    config          = require('../config.js'),
    errors          = require('./errors'),
    logs            = require('./logs');

const expressStaticGzip = require('express-static-gzip');
const routes            = require('./routes');

module.exports.init = function() {
    var staticOptions = {
        dotfiles: 'ignore',
        etag: true,
        index: false,
        // maxAge: '1d',
        redirect: false
    };

    var errs = errors(config.verbose);

    var app = express()
        .set('port', config.port)

        // Security
        .use(helmet.contentSecurityPolicy({
            directives: {
                connectSrc: [
                    "'self'",
                    'mintdesign.prismic.io',
                    'www.google-analytics.com',
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'"
                ],
                scriptSrc: [
                    "'self'",
                    'static.cdn.prismic.io',
                    'www.google-analytics.com',
                    "'unsafe-inline'",
                ],
                fontSrc: [
                    "'self'",
                    'data:'
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    'www.google-analytics.com',
                    'mintdesign.cdn.prismic.io',
                    'images.prismic.io'
                ],
                objectSrc: [
                    "'none'",
                ]
            },
            browserSniff: true,
            loose: true,
        }))
        .use(helmet.dnsPrefetchControl())
        .use(helmet.frameguard({ action: 'deny' }))
        .disable('x-powered-by')
        .use(helmet.hsts({
            // 12 months 60 * 60 * 24 * 365
            maxAge: 31536000
        }))
        .use(helmet.ieNoOpen())
        .use(helmet.noSniff())
        .use(helmet.xssFilter())

        .set('view engine', 'pug')
        .set('views',        config.dir('views'))
        .set('view cache',   config.production)

        .use(favicon(config.dir('public') + '/favicon.ico'))
        .use(logs(config.verbose))
        .use(robots({ UserAgent: '*' }))

        .use(compress({
            level: 9
        }))

        .enable('etag')

        .use(cookieParser({
            secret: 'mintdesign123martheogchristian'
        }))
        .use(methodOverride())
        .use('/public', expressStaticGzip(config.dir('public'), {
            index: false
        }));
        // .use('/public', express.static(config.dir('public'), staticOptions));

    routes(app);

    app
        .use(errs.notFound)
        .use(errs.log)
        // .use(errs.json)
        .use(errs.html);

    busBoy.extend(app);

    if (config.development) {
        app.use(errorHandler());
        app.set('showStackError', true);
    }

    return http.createServer(app);
};
