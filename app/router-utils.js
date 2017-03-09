var config          = require('../config');
var putils          = require('../prismic-utils');
var Prismic         = require('prismic-nodejs');

function getAPI(req, res) {
    res.locals.ctx = {
        endpoint:       config.apiEndpoint,
        linkResolver:   putils.linkResolver
    };

    return Prismic.api(config.apiEndpoint, {
        accessToken:    config.accessToken,
        req:            req
    });
}

function handleError(err, req, res) {
    if (err.status === 404) {
        res.status(404).send("404 not found");
    } else {
        res.status(500).send("Error 500: " + err.message);
    }
}

module.exports.handleError = handleError;

module.exports.routeHandler = function(route) {
    return function(req, res) {
        getAPI(req, res).then(function(api) {
            route(api, req, res);
        }).catch(function(err) {
            handleError(err, req, res);
        });
    };
};

module.exports.render = function(res, layout, template, content) {
    var options = {
        layout: layout
    };

    Object.keys(content).forEach(function(key) {
        if (key === 'layout') {
            logger.log({
                type:   'error',
                msg:    'Render: Content object cannot contain a '+
                        'property called layout'
            });
        }
        options[key] = content[key];
    });

    res.render(template, options);
}
