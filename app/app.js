var logger          = require('logfmt');
var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var config          = require('../config');

module.exports.home = function(req, res, next) {
    var content = {
        head: {}
    };

    Promise.all([
        getProjects(res.locals.ctx, 12, 'published desc', content),
        getCommon(res.locals.ctx, content)
    ])
    .then(function (results) {

        var projects = results[0];
        if (projects.length > 0) {
            content.head.image = projects[0].image;
        }
        render(res, 'home', content);

    }, function() {
        res.send('Error');
    });

};

module.exports.about = function(req, res, next) {
    var content = {};

    getCommon(res.locals.ctx, content)
    .then(function (common) {
        render(res, 'about', content);
    }, function() {
        res.send('Error');
    });
};

module.exports.project = function(req, res, next) {
};

module.exports.projects = function(req, res, next) {
    var content = {};

    Promise.all([
        getProjects(res.locals.ctx, undefined, 'published desc', content),
        getCommon(res.locals.ctx, content)
    ])
    .then(function (results) {
        render(res, 'projects', content);
    }, function() {
        res.send('Error');
    });

};

function render(res, template, content) {
    var options = {
        layout: 'main'
    };

    Object.keys(content).forEach(function(key) {
        if (key === 'layout') {
            logger.log({
                type: 'error',
                msg:  'Render: Content object cannot contain a property called layout'
            });
        }
        options[key] = content[key];
    });

    res.render(template, options);
}

function getProjects(ctx, limit, sort, content) {
    content = content || {};
    content.projects = [];
    var results = content.projects;

    limit = limit || undefined;

    if (sort) {
        sort = '[my.project.'+sort+']';
    } else {
        sort = undefined;
    }

    return new Promise(function (resolve, reject) {

        query(ctx, {
            type:  'project',
            limit: limit,
            sort:  sort
        })

        .then(function(projects) {

            projects.results.forEach(function(project) {
                var image = project.get('project.image');
                results.push({
                    name:           project.getText('project.name'),
                    description:    project.getText('project.description'),
                    body:           project.getText('project.body'),
                    image: {
                        small:      image.views.small.url,
                        medium:     image.views.medium.url,
                        wide:       image.views.wide.url,
                        main:       image.main.url,
                        alt:        image.main.alt
                    }
                });

                resolve(results);
            });

        }, function(reason) {
            reject(reason);
        });

    });
}

function getCommon(ctx, content) {
    content = content || {};
    content.common = {};
    var results = content.common;

    return new Promise(function (resolve, reject) {
        getBookmarks(ctx)
        .then(function(bookmarks) {

            var a = bookmarks.about;
            if (a) {
                var about_image = a.get('about.image');
                results.companyname =           a.getText('about.companyname');
                results.tagline =               a.getText('about.tagline');
                results.image = {
                    small:                      about_image.views.small.url,
                    medium:                     about_image.views.medium.url,
                    wide:                       about_image.views.wide.url,
                    main:                       about_image.main.url,
                    alt:                        about_image.main.alt
                };
            }

            var c = bookmarks.contact;
            if (c) {
                results.contact = {};
                results.contact.email =         c.getText('contact.email');
                results.contact.telephone =     c.getText('contact.telephone');
                results.contact.address =       c.getText('contact.address');
                results.contact.location =      c.getText('contact.location');
            }

            resolve(results);

        }, function() {
            reject('Could not get common');
        });
    });
}

function getBookmarks(ctx) {
    var bookmarks = ctx.api.data.bookmarks;
    var arr = [];

    Object.keys(bookmarks).forEach(function(name) {
        arr.push(bookmarks[name]);
    });

    return new Promise(function (resolve, reject) {
        query(ctx, { id: arr })
        .then(function(articles) {
            var bm = {};

            articles.results.map(function(article) {
                Object.keys(bookmarks).forEach(function(bookmark) {
                    if (bookmarks[bookmark] === article.id) {
                        bm[bookmark] = article;
                    }
                });
            });

            resolve(bm);
        }, function(err) {
            console.log('error: '+err);
            reject(err);
        });
    });
}

function query(ctx, params) {
    if (!ctx.api || !ctx.ref) {
        logger.log({
            type: 'warning',
            msg:  'ctx must include a reference and Prismic API'
        });
        return false;
    }

    var limit = params.limit || 20;
    var sort = params.sort || false;

    var predicate = null;

    if (params.type) {
        if (typeof params.type === 'string') {
            predicate = Prismic.Predicates.at('document.type', params.type);
        }
        if (params.type instanceof Array) {
            predicate = Prismic.Predicates.any('document.type', params.type);
        }
    }

    if (params.id && predicate === null) {
        if (typeof params.id === 'string') {
            predicate = Prismic.Predicates.at('document.id', params.id);
        }
        if (params.id instanceof Array) {
            predicate = Prismic.Predicates.any('document.id', params.id);
        }
    }

    if (predicate === null) {
        logger.log({
            type: 'warning',
            msg:  'Missing query type or id'
        });
        return false;
    }

    return new Promise(function (resolve, reject) {
        var request = ctx.api.form('everything')
            .ref(ctx.ref)
            .query(predicate)
            .pageSize(limit);

        if (sort) {
            request.orderings(sort);
        }

        request.submit(function(err, response) {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Router middleware that adds a Prismic context to the res object
// TODO: put in separate module
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
