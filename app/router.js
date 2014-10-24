var express         = require('express');
var path            = require('path');
var serveStatic     = require('serve-static');

var config          = require('../config');
var app             = require('./app');

module.exports = function() {
    var router = express.Router();

    router
        .get('/',               app.prismic, app.home)
        .get('/page/:name',     app.prismic, app.page)
        .get('/projects',       app.prismic, app.projects)
        .get('/project/:name',  app.prismic, app.project)

        .use('/public',         express.static(config.public_dir));

        // if (config.production) {
        //     router.use(function(req, res, next) {
        //         if (req.headers['x-forwarded-proto'] != 'https') {
        //             return res.redirect('https://' + req.get('Host') + req.url);
        //         }
        //         next();
        //     });
        // }

    return router;
};

