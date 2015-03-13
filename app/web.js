var fs              = require('fs');

var path            = require('path');
var express         = require('express');
var exphbs          = require('express-handlebars');
var compress        = require('compression');
var favicon         = require('serve-favicon');
var helmet          = require('helmet');
var cookieParser    = require('cookie-parser');

var router          = require('./router');
var errors          = require('./errors');
var logs            = require('./logs');
var hbHelpers       = require('./helpers/handlebars');
var config          = require('../config');

var web;
var errs;
var hbs_ext = '.hbs';

var hbs = exphbs.create({
    extname:        hbs_ext,
    defaultLayout:  'main',
    helpers:        hbHelpers,
    layoutsDir:     config.dir('layout'),
    partialsDir:    config.dir('partials')
});

module.exports = function() {

    errs = errors(config.verbose);
    web = express();

    if (config.development) {
        web.set('showStackError', true);
    }

    web.engine(hbs_ext,     hbs.engine);
    web.set('view engine',  hbs_ext);
    web.set('views',        config.dir('views'));
    web.set('view cache',   config.production);

    web
        .use(logs(config.verbose))
        .use(compress({
            filter: function (req, res) {
                return /json|text|javascript|css|svg/.test(res.getHeader('Content-Type'));
            },
            level: 9
        }))
        .use(favicon(config.dir('public') + '/favicon.ico'))
        .use(cookieParser({
            secret: 'mintdesign123martheogchristian'
        }))
        .use(helmet())
        .use(router())
        .use(errs.notFound)
        .use(errs.log)
        // .use(errs.json)
        .use(errs.html);

    return web;
};
