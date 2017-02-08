var putils          = require('../prismic-utils');
var config          = require('../config');
var utils           = require('./utils.js');
var clean           = require('./modules/clean');
var Prismic         = require('prismic-nodejs');




// optimize queries
// fix ssl
// test performance without cloudfront
// google analytics


















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

function routeHandler(route) {
    return function(req, res) {
        getAPI(req, res).then(function(api) {
            route(api, req, res);
        }).catch(function(err) {
            handleError(err, req, res);
        });
    };
}

function preview(api, req, res) {
    return Prismic.preview(api, putils.linkResolver, req, res);
}

function frontpage(api, req, res) {
    var content = utils.defaultContent('home', req);

    // get 12 projects sorted by date
    var q_projects = api.query([
        Prismic.Predicates.at('document.type', 'project')
    ], {
        pageSize : 12,
        page : 1,
        orderings : '[my.project.published desc]',
        fetch: [
            'project.id',
            'project.image',
            'project.name',
            'project.description',
        ]
    });

    // Could have used one of the helper methods on the api
    // object if the articles had the UID field, but they
    // don't. I don't want to mess up the inbound links.
    var q_frontpage = api.query([
        Prismic.Predicates.at('document.type', 'frontpage')
    ]);

    var q_about = api.query([
        Prismic.Predicates.at('document.type', 'about')
    ]);

    var q_contact = api.query([
        Prismic.Predicates.at('document.type', 'contact')
    ]);

    Promise.all([
        q_projects,
        q_frontpage,
        q_about,
        q_contact
    ])
    .then(function(contents) {

        var projects = contents[0].results;
        content.projects = [];

        for (var i=0; i<projects.length; i++) {
            var p = projects[i];
            content.projects.push({
                id:             p.id,
                link:           config.pageUrl(req)
                                + utils.documentLink('work', p),
                image:          utils.getImage(p.getImage('project.image')),
                name:           p.getText('project.name'),
                description:    p.getText('project.description'),
            });
        }

        var frontpage = contents[1].results[0];
        content.head = {};

        var coverimage = utils.getImage(frontpage.getImage('frontpage.coverimage'));
        if (typeof coverimage === 'undefined') {
            content.head.image = utils.getImage(projects[0].getImage('project.image'));
        } else {
            content.head.image = coverimage;
        }

        content.frontpage = {
            coverimage:     coverimage
        };

        content.common = {};

        var about = contents[2].results[0];
        content.common.about = {
            headline:       about.getText('about.headline'),
            companyname:    about.getText('about.companyname'),
            tagline_text:   utils.getStructuredText(about, 'about.tagline', 'asText'),
            tagline:        utils.getStructuredText(about, 'about.tagline', 'asHtml'),
            content:        utils.getStructuredText(about, 'about.content', 'asHtml'),
            image:          utils.getImage(about.get('about.image'))
        };

        var contact = contents[3].results[0];
        content.common.contact = {
            image:      utils.getImage(contact.get('contact.image')),
            email:      utils.emailLink(contact.getText('contact.email')),
            telephone:  utils.getText(contact, 'contact.telephone'),
            facebook:   utils.getText(contact, 'contact.facebook'),
            instagram:  utils.getText(contact, 'contact.instagram'),
            linkedin:   utils.getText(contact, 'contact.linkedin'),
            address:    utils.getStructuredText(contact, 'contact.address', 'asHtml'),
            location:   contact.getGeoPoint('contact.location')
        };

        render(res, 'main', 'home', content);
    })

    .catch(function(err) {
        handleError(err, req, res);
    });
}

function about(api, req, res) {
    var content = utils.defaultContent('about', req);

    var q_about = api.query([
        Prismic.Predicates.at('document.type', 'about')
    ]);

    var q_contact = api.query([
        Prismic.Predicates.at('document.type', 'contact')
    ]);

    Promise.all([
        q_about,
        q_contact
    ])
    .then(function(contents) {
        content.common = {};

        var about = contents[0].results[0];
        content.common.about = {
            headline:       about.getText('about.headline'),
            companyname:    about.getText('about.companyname'),
            tagline_text:   utils.getStructuredText(about, 'about.tagline', 'asText'),
            tagline:        utils.getStructuredText(about, 'about.tagline', 'asHtml'),
            content:        utils.getStructuredText(about, 'about.content', 'asHtml'),
            image:          utils.getImage(about.get('about.image'))
        };

        var employees = about.getGroup('about.employees').toArray();
        content.common.about.employees = [];

        for (var i=0; i<employees.length; i++) {
            var employee = employees[i];
            content.common.about.employees.push({
                image:      utils.getImage(employee.getImage('image')),
                fullname:   utils.getText(employee, 'fullname'),
                about:      utils.getStructuredText(employee, 'about', 'asHtml'),
                telephone:  utils.getText(employee, 'telephone'),
                title:      utils.getText(employee, 'title'),
                email:      utils.emailLink(employee.getText('email')),
                id:         'employee_' + i,
                i:          i
            });
        }

        var contact = contents[1].results[0];
        content.common.contact = {
            image:      utils.getImage(contact.get('contact.image')),
            email:      utils.emailLink(contact.getText('contact.email')),
            telephone:  utils.getText(contact, 'contact.telephone'),
            facebook:   utils.getText(contact, 'contact.facebook'),
            instagram:  utils.getText(contact, 'contact.instagram'),
            linkedin:   utils.getText(contact, 'contact.linkedin'),
            address:    utils.getStructuredText(contact, 'contact.address', 'asHtml'),
            location:   contact.getGeoPoint('contact.location')
        };

        render(res, 'main', 'about', content);
    })

    .catch(function(err) {
        handleError(err, req, res);
    });
}

function contact(api, req, res) {
    var content = utils.defaultContent('contact', req);

    var q_about = api.query([
        Prismic.Predicates.at('document.type', 'about')
    ]);

    var q_contact = api.query([
        Prismic.Predicates.at('document.type', 'contact')
    ]);

    Promise.all([
        q_about,
        q_contact
    ])
    .then(function(contents) {
        content.common = {};

        var about = contents[0].results[0];
        content.common.about = {
            headline:       about.getText('about.headline'),
            companyname:    about.getText('about.companyname'),
            tagline_text:   utils.getStructuredText(about, 'about.tagline', 'asText'),
            tagline:        utils.getStructuredText(about, 'about.tagline', 'asHtml'),
            content:        utils.getStructuredText(about, 'about.content', 'asHtml'),
            image:          utils.getImage(about.get('about.image'))
        };

        var contact = contents[1].results[0];
        content.common.contact = {
            image:      utils.getImage(contact.get('contact.image')),
            email:      utils.emailLink(contact.getText('contact.email')),
            telephone:  utils.getText(contact, 'contact.telephone'),
            facebook:   utils.getText(contact, 'contact.facebook'),
            instagram:  utils.getText(contact, 'contact.instagram'),
            linkedin:   utils.getText(contact, 'contact.linkedin'),
            address:    utils.getStructuredText(contact, 'contact.address', 'asHtml'),
            location:   contact.getGeoPoint('contact.location')
        };

        render(res, 'main', 'contact', content);
    })

    .catch(function(err) {
        handleError(err, req, res);
    });
}

function works(api, req, res) {
    var content = utils.defaultContent('works', req);

    var q_projects = api.query([
        Prismic.Predicates.at('document.type', 'project')
    ], {
        pageSize : 50,
        page : 1,
        orderings : '[my.project.published desc]'
    });

    var q_about = api.query([
        Prismic.Predicates.at('document.type', 'about')
    ], {
        fetch: [
            'about.companyname'
        ]
    });

    var q_contact = api.query([
        Prismic.Predicates.at('document.type', 'contact')
    ], {
        fetch: [
            'contact.email',
            'contact.telephone',
            'contact.facebook',
            'contact.instagram',
            'contact.linkedin'
        ]
    });

    Promise.all([
        q_projects,
        q_about,
        q_contact
    ])
    .then(function(contents) {
        content.common = {};

        var projects = contents[0].results;
        content.projects = [];

        for (var i=0; i<projects.length; i++) {
            var p = projects[i];
            content.projects.push({
                i:              i,
                id:             p.id,
                link:           config.pageUrl(req)
                                + utils.documentLink('work', p),
                image:          utils.getImage(p.getImage('project.image')),
                name:           p.getText('project.name'),
                description:    p.getText('project.description'),
            });
        }

        var about = contents[1].results[0];
        content.common.about = {
            companyname:    about.getText('about.companyname'),
        };

        var contact = contents[2].results[0];
        content.common.contact = {
            email:      utils.emailLink(contact.getText('contact.email')),
            telephone:  utils.getText(contact, 'contact.telephone'),
            facebook:   utils.getText(contact, 'contact.facebook'),
            instagram:  utils.getText(contact, 'contact.instagram'),
            linkedin:   utils.getText(contact, 'contact.linkedin'),
        };

        render(res, 'main', 'projects', content);
    })

    .catch(function(err) {
        handleError(err, req, res);
    });
}

function work(api, req, res) {
    var slug = clean(req.params.slug);
    var content = utils.defaultContent('work', req);

    var q_project = api.query([
        Prismic.Predicates.at('document.id', req.params.id)
    ], {
        orderings : '[my.project.published desc]'
    });

    var q_about = api.query([
        Prismic.Predicates.at('document.type', 'about')
    ]);

    var q_contact = api.query([
        Prismic.Predicates.at('document.type', 'contact')
    ]);

    Promise.all([
        q_project,
        q_about,
        q_contact
    ])
    .then(function(contents) {
        var projects = contents[0].results;

        if (projects.length === 0) {
            return res.redirect(301, '/works');
        }

        var project = projects[0];
        var link = config.pageUrl(req) + utils.documentLink('work', project);

        if (project.slug != slug &&
            project.slugs.indexOf(slug) >= 0) {
            return res.redirect(301, link);
        }

        var og_desc = project.getStructuredText('project.body');
        if (typeof og_desc === 'undefined') {
            og_desc = '';
        } else {
            og_desc = project.getFirstParagraph().text;
        }

        content.project = {
            i:              i,
            id:             project.id,
            link:           link,
            image:          utils.getImage(project.getImage('project.image')),
            name:           utils.getText(project, 'project.name'),
            description:    utils.getText(project, 'project.description'),
            og_description: og_desc,
            body:           utils.getStructuredText(project, 'project.body', 'asHtml'),
            slug:           project.slug,
            slugs:          project.slugs,
        }

        var gallery = project.getGroup('project.gallery').toArray();
        content.project.gallery = [];
        for (var i=0; i<gallery.length; i++) {
            var g = gallery[i];
            content.project.gallery.push(
                utils.getImage(g.getImage('image'))
            );
        }

        content.common = {};

        var about = contents[1].results[0];
        content.common.about = {
            companyname:    about.getText('about.companyname'),
        };

        var contact = contents[2].results[0];
        content.common.contact = {
            email:      utils.emailLink(contact.getText('contact.email')),
            telephone:  utils.getText(contact, 'contact.telephone'),
            facebook:   utils.getText(contact, 'contact.facebook'),
            instagram:  utils.getText(contact, 'contact.instagram'),
            linkedin:   utils.getText(contact, 'contact.linkedin'),
        };

        render(res, 'main', 'project', content);
    })

    .catch(function(err) {
        handleError(err, req, res);
    });
}

module.exports.init = function(app) {
    app.route('/preview').get(routeHandler(preview));
    app.route('/').get(routeHandler(frontpage));
    app.route('/about').get(routeHandler(about));
    app.route('/contact').get(routeHandler(contact));
    app.route('/works').get(routeHandler(works));
    app.route('/work/:slug/:id').get(routeHandler(work));
    app
        .route('/.well-known/acme-challenge/:id')
        .get(function(req, res) {
            res.send('qIP8edMzQn3Ybx6j6THsA2iRYTYebbrzjblGeS5HgT4.UEnVpJuLLwdQNXYhpSnU6oj80p2iLLVYqF4WP5_pb4s');
        });
};

function render(res, layout, template, content) {
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
