var express         = require('express');
var path            = require('path');
var serveStatic     = require('serve-static');

var config          = require('../config');
var app             = require('./app');

module.exports = function() {
    var router = express.Router();

    router
        .get('/',               app.prismic, app.home)
        .get('/about',          app.prismic, app.about)
        .get('/contact',        app.prismic, app.contact)
        .get('/works',          app.prismic, app.projects)
        .get('/work/:name',     app.prismic, app.project)

        .use('/public',         express.static(config.public_dir));

    if (config.development) {
        router.get('/app/views/:folder/:file', function(req, res, next) {
            res.sendFile(path.resolve('./app/views/'+req.params.folder,
                         req.params.file));
        });
    }

    return router;
};

