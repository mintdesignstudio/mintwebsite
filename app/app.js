var express         = require('express'),
    exphbs          = require('express-handlebars')
    favicon         = require('serve-favicon'),
    busBoy          = require('express-busboy'),
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

        .engine(hbs_ext,     hbs.engine)
        .set('view engine',  hbs_ext)
        .set('views',        config.dir('views'))
        .set('view cache',   config.production)

        .use(favicon(config.dir('public') + '/favicon.ico'))
        .use(logs(config.verbose))

        .use(compress({
            filter: function (req, res) {
                return /json|text|javascript|css|svg/.test(res.getHeader('Content-Type'));
            },
            level: 9
        }))

        .use(cookieParser({
            secret: 'mintdesign123martheogchristian'
        }))

        .use(helmet())
        .use(methodOverride());

    app.use('/public', express.static(config.dir('public'), staticOptions));

    router.init(app);

    // redirect http to https

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
