var util            = require('util');
var logger          = require('logfmt');
var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var config          = require('../config');
var clean           = require('./modules/clean');
var projects        = require('./modules/projects');
var common          = require('./modules/common');

module.exports.home = function(req, res, next) {
    var content = {
        head: {}
    };

    Promise.all([
        projects.get(res.locals.ctx, 12, 'published desc', content),
        common.get(res.locals.ctx, content)
    ])
    .then(function(results) {

        var projects = results[0];
        if (projects.length > 0) {
            content.head.image = projects[0].image;
        }
        render(res, 'main', 'home', content);

        console.log(util.inspect(process.memoryUsage()));

    }, function() {
        res.send('Home error');
    });

};

module.exports.about = function(req, res, next) {
    var content = {};

    common.get(res.locals.ctx, content)
    .then(function (common) {
        render(res, 'main', 'about', content);
        console.log(util.inspect(process.memoryUsage()));
    }, function() {
        res.send('Error');
    });
};

module.exports.contact = function(req, res, next) {
    var content = {};

    common.get(res.locals.ctx, content)
    .then(function (common) {
        render(res, 'main', 'contact', content);
        console.log(util.inspect(process.memoryUsage()));
    }, function() {
        res.send('Error');
    });
};

module.exports.project = function(req, res, next) {
    var name = clean(req.params.name);
    var content = {};

    Promise.all([
        projects.get(res.locals.ctx, undefined, 'published desc'),
        common.get(res.locals.ctx, content)
    ])
    .then(function (results) {

        var i;
        var l = results[0].length;
        content.project = null;

        for (i=0; i<l; i+=1) {
            content.project = results[0][i];
            if (content.project.slug == name) {
                break;
            }
        }

        if (content.project === null) {
            return res.redirect(301, '/works');
        }

        render(res, 'main', 'project', content);
        console.log(util.inspect(process.memoryUsage()));

        i = null;
        l = null;

    }, function() {
        res.send('Error');
    });

};

module.exports.projects = function(req, res, next) {
    var content = {};

    Promise.all([
        projects.get(res.locals.ctx, undefined, 'published desc', content),
        common.get(res.locals.ctx, content)
    ])
    .then(function (results) {
        render(res, 'main', 'projects', content);
        console.log(util.inspect(process.memoryUsage()));
    }, function() {
        res.send('Error');
    });

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
