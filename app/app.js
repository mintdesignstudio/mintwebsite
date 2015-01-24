var util            = require('util');
var logger          = require('logfmt');
var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var config          = require('../config');
var clean           = require('./modules/clean');
var projects        = require('./modules/projects');
var common          = require('./modules/common');

var app = {
    home: function(req, res, next) {

        res.send('Home');
        // console.log('home', res.locals.ctx);

        // var content = {
        //     head: {}
        // };

        // Promise.all([
        //     projects.get(res.locals.ctx, {
        //         limit: 12,
        //         sort: 'published desc'}, content),
        //     common.get(res.locals.ctx, content)
        // ])
        // .then(function(results) {

        //     var projects = results[0];
        //     if (projects.length > 0) {
        //         content.head.image = projects[0].image;
        //     }
        //     app.render(res, 'main', 'home', content);

        //     console.log(util.inspect(process.memoryUsage()));

        // }, function() {
        //     res.send('Home error');
        // });
    },

    about: function(req, res, next) {
        var content = {};

        common.get(res.locals.ctx, content)
        .then(function (common) {
            app.render(res, 'main', 'about', content);
            console.log(util.inspect(process.memoryUsage()));
        }, function() {
            res.send('About error');
        });
    },

    contact: function(req, res, next) {
        var content = {};

        common.get(res.locals.ctx, content)
        .then(function (common) {
            app.render(res, 'main', 'contact', content);
            console.log(util.inspect(process.memoryUsage()));
        }, function() {
            res.send('Contact error');
        });
    },

    project: function(req, res, next) {
        var slug = clean(req.params.slug);
        var content = {};

        Promise.all([
            projects.get(res.locals.ctx, {
                sort:   'published desc',
                id:     req.params.id
            }, content),
            common.get(res.locals.ctx, content)
        ])
        .then(function (results) {

            if (content.projects.length === 0) {
                return res.redirect(301, '/works');
            }

            content.project = content.projects[0];

            if (content.project.slug != slug &&
                content.project.slugs.indexOf(slug) >= 0) {
                return res.redirect(301, projects.link(content.project));
            }

            app.render(res, 'main', 'project', content);
            console.log(util.inspect(process.memoryUsage()));

        }, function() {
            return res.redirect(301, '/works');
        });

    },

    projects: function(req, res, next) {
        var content = {};

        Promise.all([
            projects.get(res.locals.ctx, {sort: 'published desc'}, content),
            common.get(res.locals.ctx, content)
        ])
        .then(function (results) {
            app.render(res, 'main', 'projects', content);
            console.log(util.inspect(process.memoryUsage()));
        }, function() {
            res.send('Projects error');
        });

    },

    render: function(res, layout, template, content) {
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
};

module.exports = app;
