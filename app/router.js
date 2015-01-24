var express         = require('express');
var path            = require('path');
var serveStatic     = require('serve-static');

var config          = require('../config');
var app             = require('./app');
var middleware      = require('./middleware');

var threeMonths = 60 * 60 * 24 * 90;

module.exports = function() {
    var router = express.Router();
    var pubdir = config.development ?
                 config.public_dir :
                 config.prod_dir + '/public';

    router
        .get('/',
             middleware.prismic,
             middleware.construction,
             app.home)

        .get('/about',
             middleware.prismic,
             middleware.construction,
             app.about)

        .get('/contact',
             middleware.prismic,
             middleware.construction,
             app.contact)

        .get('/works',
             middleware.prismic,
             middleware.construction,
             app.projects)

        .get('/work/:slug/:id',
             middleware.prismic,
             middleware.construction,
             app.project)

        .use('/public', express.static(pubdir, { maxAge: threeMonths }));

    return router;
};

