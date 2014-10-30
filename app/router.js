var express         = require('express');
var path            = require('path');
var serveStatic     = require('serve-static');

var config          = require('../config');
var app             = require('./app');

module.exports = function() {
    var router = express.Router();

    // / > home
    // /projects > all projects (pagination?)
    // /project/:name > single project (use slug?)
    // /about > about, employees, awards and contact

    router
        .get('/',               app.prismic, app.home)
        .get('/about',          app.prismic, app.about)
        .get('/works',          app.prismic, app.projects)
        .get('/work/:name',     app.prismic, app.project)

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

