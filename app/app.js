var logger          = require('logfmt');
var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var config          = require('../config');

module.exports.home = function(req, res, next) {
    var content = {
        companyname: '',
        tagline: '',
        head: {
            image: {}
        },
        projects: [],
        contact: {}
    };

    query(res.locals.ctx, {
        type:  'project',
        limit: 12})
    .then(function(posts) {
        posts.results.forEach(function(post, num) {
            var image = post.get('project.image');

            if (num === 0) {
                content.head.image.small =  image.views.small.url;
                content.head.image.medium = image.views.medium.url;
                content.head.image.wide =   image.views.wide.url;
                content.head.image.main =   image.main.url;
            }

            content.projects.push({
                name:           post.getText('project.name'),
                description:    post.getText('project.description'),
                body:           post.getText('project.body'),
                image: {
                    small:  image.views.small.url,
                    medium: image.views.medium.url,
                    wide:   image.views.wide.url,
                    main:   image.main.url,
                    alt:    image.main.alt
                }
            });
        });

        return getBookmarks(res.locals.ctx);
    })

    .then(function(bookmarks) {
        var a = bookmarks.about;
        if (a) {
            content.companyname =           a.getText('about.companyname');
            content.tagline =               a.getText('about.tagline');
        }

        var c = bookmarks.contact;
        if (c) {
            content.contact.email =         c.getText('contact.email');
            content.contact.telephone =     c.getText('contact.telephone');
            content.contact.address =       c.getText('contact.address');
            content.contact.location =      c.getText('contact.location');
        }
    })

    .done(function() {
        res.render('home', {
            layout: 'main',
            content: content
        });
    }, function(reason) {
        res.send(reason);
    })
};

module.exports.about = function(req, res, next) {
    var content = {
        companyname: '',
        tagline: '',
        contact: {}
    };

    getBookmarks(res.locals.ctx)
    .then(function(bookmarks) {
        var a = bookmarks.about;
        if (a) {
            var about_image = a.get('about.image');
            content.companyname =           a.getText('about.companyname');
            content.tagline =               a.getText('about.tagline');
            content.image = {
                small:                      about_image.views.small.url,
                medium:                     about_image.views.medium.url,
                wide:                       about_image.views.wide.url,
                main:                       about_image.main.url,
                alt:                        about_image.main.alt
            };
        }

        var c = bookmarks.contact;
        if (c) {
            content.contact.email =         c.getText('contact.email');
            content.contact.telephone =     c.getText('contact.telephone');
            content.contact.address =       c.getText('contact.address');
            content.contact.location =      c.getText('contact.location');
        }

        res.render('about', {
            layout: 'main',
            content: content
        });

    }, function(reason) {
        res.send(reason);
    });
};

module.exports.project = function(req, res, next) {
};

module.exports.projects = function(req, res, next) {
};

function renderBlog(posts) {
    var html = '';
    posts.forEach(function(post) {
        html += post.get('blog.body').asHtml();
    });
    return html;
};

function renderProject(posts) {
    var html = '';
    posts.forEach(function(post) {
        html += post.get('project.name').asHtml();
        html += post.get('project.description').asHtml();
    });
    return html;
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

    limit = params.limit || 20;
    sort = params.sort || false;

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
            request.orderings('['+sort+']');
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
