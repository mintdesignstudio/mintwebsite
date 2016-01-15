var util            = require('util');
var logger          = require('logfmt');
var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var config          = require('../config');
var utils           = require('./modules/utils');
var clean           = require('./modules/clean');
var projects        = require('./modules/projects');
var common          = require('./modules/common');
var frontpage       = require('./modules/frontpage');

var app = {

    home: function(req, res, next) {
        var content = utils.defaultContent('home');
        content.head = {};

        console.log(res.locals.ctx);

        Promise.all([
            projects.get(res.locals.ctx, {
                limit: 12,
                sort: 'published desc'}, content),
            common.get(res.locals.ctx, content),
            frontpage.get(res.locals.ctx, content)
        ])
        .then(function(results) {

            var coverimage = results[2].coverimage;
            if (typeof coverimage === 'undefined') {
                var projects = results[0];
                if (projects.length > 0) {
                    content.head.image = projects[0].image;
                }
            } else {
                content.head.image = coverimage;
            }

            app.render(res, 'main', 'home', content);

            console.log(util.inspect(process.memoryUsage()));

        }, function() {
            res.send('Home error');
        });
    },

    about: function(req, res, next) {
        var content = utils.defaultContent('about');

        common.get(res.locals.ctx, content)
        .then(function (common) {
            app.render(res, 'main', 'about', content);
            console.log(util.inspect(process.memoryUsage()));
        }, function() {
            res.send('About error');
        });
    },

    contact: function(req, res, next) {
        var content = utils.defaultContent('contact');

        common.get(res.locals.ctx, content)
        .then(function (common) {
            app.render(res, 'main', 'contact', content);
            console.log(util.inspect(process.memoryUsage()));
        }, function() {
            res.send('Contact error');
        });
    },

    work: function(req, res, next) {
        var slug = clean(req.params.slug);
        var content = utils.defaultContent('work');

        Promise.all([
            projects.get(res.locals.ctx, {
                sort:   'published desc',
                id:     req.params.id
            }, content),
            common.get(res.locals.ctx, content)
        ])
        .then(function (results) {

            if (content.projects.length === 0) {
                // TODO: get path from config.routes
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
                // TODO: get path from config.routes
            return res.redirect(301, '/works');
        });

    },

    works: function(req, res, next) {
        var content = utils.defaultContent('works');

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
