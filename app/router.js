var express         = require('express');
var path            = require('path');
var serveStatic     = require('serve-static');

var config          = require('../config');
var app             = require('./app');
var middleware      = require('./middleware');

var threeMonths = 60 * 60 * 24 * 90;

module.exports = function() {
    var router = express.Router();

    router
        .get('/',               middleware.prismic, app.home)
        .get('/about',          middleware.prismic, app.about)
        .get('/contact',        middleware.prismic, app.contact)
        .get('/works',          middleware.prismic, app.projects)
        .get('/work/:name',     middleware.prismic, app.project)

        .use('/public',         express.static(config.public_dir,
                                    { maxAge: threeMonths }));

    if (config.development) {
        router.get('/app/views/:folder/:file', function(req, res, next) {
            res.sendFile(path.resolve('./app/views/'+req.params.folder,
                         req.params.file));
        });
    }

    return router;
};

