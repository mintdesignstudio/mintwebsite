var path            = require('path');
var express         = require('express');
var exphbs          = require('express-handlebars');
var helpers         = require('view-helpers');
var compress        = require('compression');
var favicon         = require('serve-favicon');
var helmet          = require('helmet');
var cookieParser    = require('cookie-parser');

var router          = require('./router');
var errors          = require('./errors');
var logs            = require('./logs');
var config          = require('../config');

var web;
var errs;
var hbs_ext = '.hbs';

// TODO: This needs to be cleaned up. Move to config

var pubdir = config.development ?
             __dirname + '/../public':
             __dirname + '/../production/public';
var layoutdir = config.development ?
                __dirname + '/views/layouts':
                __dirname + '/../production/app/views/layouts';
var partialdir = config.development ?
                 __dirname + '/views/partials':
                 __dirname + '/../production/app/views/partials';
var viewdir = config.development ?
              __dirname + '/views':
              __dirname + '/../production/app/views';

var hbs = exphbs.create({
    extname:        hbs_ext,
    defaultLayout:  'main',
    helpers:        helpers,
    layoutsDir:     layoutdir,
    partialsDir:    partialdir
});

module.exports = function() {

    errs = errors(config.verbose);
    web = express();

    if (config.development) {
        web.set('showStackError', true);
    }

    web.engine(hbs_ext,     hbs.engine);
    web.set('view engine',  hbs_ext);
    web.set('views',        viewdir);
    web.set('view cache',   config.production);

    web
        .use(logs(config.verbose))
        .use(compress({
            filter: function (req, res) {
                return /json|text|javascript|css|svg/.test(res.getHeader('Content-Type'));
            },
            level: 9
        }))
        .use(favicon(pubdir + '/favicon.ico'))
        .use(cookieParser({
            secret: 'mintdesign123martheogchristian'
        }))
        .use(router())
        .use(helmet())
        .use(errs.notFound)
        .use(errs.log)
        // .use(errs.json)
        .use(errs.html);

    return web;
};
