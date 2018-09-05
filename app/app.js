var express         = require('express'),
    exphbs          = require('express-handlebars')
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
    router          = require('./router'),
    hbHelpers       = require('./helpers/handlebars'),
    errors          = require('./errors'),
    logs            = require('./logs');

module.exports.init = function() {
    var staticOptions = {
        dotfiles: 'ignore',
        etag: true,
        index: false,
        // maxAge: '1d',
        redirect: false
    };

    var hbs_ext = '.hbs';

    var hbs = exphbs.create({
        extname:        hbs_ext,
        defaultLayout:  'main',
        helpers:        hbHelpers,
        layoutsDir:     config.dir('layout'),
        partialsDir:    config.dir('partials')
    });

    var errs = errors(config.verbose);

    var app = express()
        .set('port', config.port)

        // Security
        .use(helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: [
                    "'self'",
                ],
                connectSrc: [
                    'mintdesign.prismic.io',
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
                    'www.google-analytics.com',
                    'mintdesign.cdn.prismic.io'
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

        .engine(hbs_ext,     hbs.engine)
        .set('view engine',  hbs_ext)
        .set('views',        config.dir('views'))
        .set('view cache',   config.production)

        .use(favicon(config.dir('public') + '/favicon.ico'))
        .use(logs(config.verbose))
        .use(robots({ UserAgent: '*' }))

        .use(compress())

        .use(cookieParser({
            secret: 'mintdesign123martheogchristian'
        }))
        .use(methodOverride())
        .use('/public', express.static(config.dir('public'), staticOptions));

    if (config.production) {
        app.get('*',function(req,res,next) {
            if (req.headers['x-forwarded-proto'] !== 'https') {
                res.redirect(301, 'https://' + req.headers.host + req.url);
            } else {
                next();
            }
        });
    }

    app.get('/.well-known/acme-challenge/:acmeToken', function(req, res, next) {
        var acmeToken = req.params.acmeToken;
        var acmeKey;

        if (process.env.ACME_KEY && process.env.ACME_TOKEN) {
            if (acmeToken === process.env.ACME_TOKEN) {
                acmeKey = process.env.ACME_KEY;
            }
        }

        for (var key in process.env) {
            if (key.startsWith('ACME_TOKEN_')) {
                var num = key.split('ACME_TOKEN_')[1];
                if (acmeToken === process.env['ACME_TOKEN_' + num]) {
                    acmeKey = process.env['ACME_KEY_' + num];
                }
            }
        }

        if (acmeKey) {
            res.send(acmeKey);
        } else {
            res.status(404).send();
        }
    });

    router.init(app);

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

    return app;
};
