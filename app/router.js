var express         = require('express');
var path            = require('path');
var serveStatic     = require('serve-static');

var config          = require('../config');
var app             = require('./app');
var middleware      = require('./middleware');

var threeMonths = 60 * 60 * 24 * 90;

module.exports = function() {
    var router = express.Router();

    // Setup routes using config.json
    Object.keys(config.routes).forEach(function(page_name) {
        router.get(config.routes[page_name],
                   middleware.prismic,
                   middleware.construction,
                   app[page_name]);
    });

    router
        .use('/public', express.static(config.dir('public'), {
            maxAge: threeMonths
        }));

    return router;
};

