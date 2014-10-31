var logger          = require('logfmt');
var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var config          = require('../config');
var util            = require('util');

var valids = {
    'æ':'',
    'ø':'',
    'å':'a',
    'á':'a',
    'à':'a',
    'ä':'a',
    'â':'a',
    'ã':'a',
    'é':'e',
    'è':'e',
    'ë':'e',
    'ê':'e',
    'í':'i',
    'ì':'i',
    'ï':'i',
    'î':'i',
    'ó':'o',
    'ò':'o',
    'ö':'o',
    'ô':'o',
    'õ':'o',
    'ú':'u',
    'ù':'u',
    'ü':'u',
    'û':'u',
    'ÿ':'y',
    'ñ':'n',
    'ç':'c'
};

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

module.exports.contact = function(req, res, next) {
    var content = {};

    getCommon(res.locals.ctx, content)
    .then(function (common) {
        render(res, 'contact', content);
    }, function() {
        res.send('Error');
    });
};

module.exports.project = function(req, res, next) {
    var name = clean(req.params.name);
    var content = {};

    Promise.all([
        getProjects(res.locals.ctx, undefined, 'published desc'),
        getCommon(res.locals.ctx, content)
    ])
    .then(function (results) {

        var projects = results[0];
        var project = [];
        projects.forEach(function(proj) {
            if (proj.slug === name) {
                project.push(proj);
            }
        });

        if (project.length === 0) {
            return res.redirect(301, '/works');
        }

        content.project = project[0];

        render(res, 'project', content);

    }, function() {
        res.send('Error');
    });

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

function clean(name) {
    var chars = [];
    name.toLowerCase().split('').forEach(function(ch) {
        chars.push(valids[ch] ? valids[ch] : ch);
    });
    return chars.join('');
}

function render(res, template, content) {
    var options = {
        layout: 'main'
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

            var _gallery;
            var _result;

            projects.results.forEach(function(project) {

                _result = {};

                _result.image = getImage(project.get('project.image'));

                _result.gallery = [];
                _gallery = project.getGroup('project.gallery');
                if (_gallery) {
                    _gallery.value.forEach(function(obj) {
                        _result.gallery.push(getImage(obj.image));
                    });
                }

                _result.name =          project.getText('project.name');
                _result.description =   project.getText('project.description');
                _result.body =          project.getText('project.body');
                _result.slug =          project.slug;
                _result.slugs =         project.slugs;

                results.push(_result);
            });

            resolve(results);

        }, function(reason) {
            reject(reason);
        });

    });
}

function getImage(img) {
    return {
        small:     img ? img.views.small.url : '',
        medium:    img ? img.views.medium.url : '',
        wide:      img ? img.views.wide.url : '',
        main:      img ? img.main.url : '',
        alt:       img ? img.main.alt : ''
    };
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
