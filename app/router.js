var express         = require('express');
var path            = require('path');
var serveStatic     = require('serve-static');

module.exports = function(app, config) {
    var router = express.Router();

    router
        .get('/', app.home)
        .get('/page/:name', app.page)
        .get('/project/:name', app.project)

        .use('/public', express.static(config.public_dir));

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

