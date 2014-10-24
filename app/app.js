var logger          = require('logfmt');
var Prismic         = require('prismic.io').Prismic;
var config          = require('../config');

module.exports.home = function(req, res, next) {
    var html = '';
    var got_blog = false;
    var got_proj = false;

    res.locals.ctx.api.form('everything')
        .ref(res.locals.ctx.ref)
        .query(Prismic.Predicates.at('document.type', 'blog'))
        .submit(function(err, response) {
            got_blog = true;
            if (err) {
                return res.send(err);
            }
            // res.json(response.results);
            response.results.forEach(function(blog_post) {
                html += blog_post.get('blog.body').asHtml();
            });
            if (got_proj) {
                res.send(html);
            }
        });

    res.locals.ctx.api.form('everything')
        .ref(res.locals.ctx.ref)
        .query(Prismic.Predicates.at('document.type', 'project'))
        .submit(function(err, response) {
            got_proj = true;
            if (err) {
                return res.send(err);
            }
            // res.json(response.results);
            // var html = '';
            response.results.forEach(function(post) {
                html += post.get('project.name').asHtml();
                html += post.get('project.description').asHtml();
            });
            // res.send(html);
            if (got_blog) {
                res.send(html);
            }
        });
};

module.exports.page = function(req, res, next) {};

module.exports.project = function(req, res, next) {
    res.locals.ctx.api.form('everything')
        .ref(res.locals.ctx.ref)
        .query(Prismic.Predicates.at('my.project.slug', req.params.name))
        .submit(function(err, response) {
            if (err) {
                return res.send(err);
            }

            // res.json(response.results);
            var html = '';
            response.results.forEach(function(post) {
                html += post.get('project.name').asHtml();
            });
            res.send(html);
        });
};

module.exports.projects = function(req, res, next) {
    res.locals.ctx.api.form('everything')
        .ref(res.locals.ctx.ref)
        .query(Prismic.Predicates.at('document.type', 'project'))
        .submit(function(err, response) {
            if (err) {
                return res.send(err);
            }
            res.json(response.results);
            // var html = '';
            // response.results.forEach(function(post) {
            //     html += post.get('project.name').asHtml();
            //     html += post.get('project.description').asHtml();
            // });
            // res.send(html);
        });
};


// Router middleware that adds a Prismic context to the res object
module.exports.prismic = function(req, res, next) {
    Prismic.Api(config.apiEndpoint, function(err, Api) {
        if (err) {
            return res.send(500, 'Error 500: ' + err.message);
        }

        var ref = req.query['ref'] || Api.master();
        var ctx = {
            api:        Api,
            ref:        ref,
            maybeRef:   ref == Api.master() ? undefined : ref,

            oauth: function() {
                var token = accessToken;
                return {
                    accessToken:            token,
                    hasPrivilegedAccess:    !!token
                }
            },

            linkResolver: function(ctx, doc) {
                if (doc.isBroken) {
                    return false;
                }
                return '/documents/' + doc.id + '/' + doc.slug +
                       (ctx.maybeRef ? '?ref=' + ctx.maybeRef : '');
            }
        };
        res.locals.ctx = ctx;
        next();

    }, config.accessToken);
};
