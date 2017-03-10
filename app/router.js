var ru              = require('./router-utils');
var putils          = require('../prismic-utils');
var config          = require('../config');
var utils           = require('./utils.js');
var clean           = require('./modules/clean');
var queries         = require('./queries');
var chandlers       = require('./content-handlers');
var Prismic         = require('prismic-nodejs');

var routes = {
    '/preview':         preview,
    '/':                frontpage,
    '/about':           about,
    '/contact':         contact,
    '/services':        services,
    '/works':           works,
    '/work/:slug/:id':  workOld,
    '/work/:slug/':     work,
};

function preview(api, req, res) {
    return Prismic.preview(api, putils.linkResolver, req, res);
}

function frontpage(api, req, res) {
    queries
    .create(api, req)
    .doctype('project', {
        pageSize : 12,
        page : 1,
        orderings : '[my.project.published desc]',
        fetch: [
            'project.id',
            'project.image',
            'project.name',
            'project.description',
        ]
    })
    .doctype('frontpage')
    .doctype('about')
    .doctype('contact')
    .doctype('services')
    .doctype('menu')
    .process()

    .then(function(contents) {

        var content = utils.defaultContent('home', req);
        content.head = {};

        content.projects = chandlers.getProjects(contents[0].results, req);

        var frontpage = contents[1].results[0];

        var coverimage = utils.getImage(frontpage.getImage('frontpage.coverimage'));
        content.head.image = typeof coverimage === 'undefined'
            ? utils.getImage(content.projects[0].image)
            : coverimage;

        content.frontpage = {
            coverimage:     coverimage
        };

        content.common = {};

        var about = contents[2].results[0];
        content.common.about = chandlers.getAbout(about, req);

        var max_clients = frontpage.getNumber('frontpage.max-num-clients');
        content.common.about.clients = chandlers.getClients(about, max_clients, req);

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

        if (contents[4].results.length > 0) {
            var services = contents[4].results[0];
            var srv_group = services.getGroup('services.services').toArray();
            content.services = [];

            for (var i=0; i<srv_group.length; i++) {
                var service = srv_group[i];
                content.services.push({
                    link:       config.siteUrl(req) + 'services/#' + service.getText('uid'),
                    title:      utils.getStructuredText(service, 'title', 'asHtml'),
                    icon:       utils.getImage(service.getImage('icon')),
                    excerpt:    utils.getStructuredText(service, 'excerpt', 'asHtml'),
                });
            }
        }

        content.menu = chandlers.getMenu(contents[5].results[0]);

        ru.render(res, 'main', 'home', content);
    })

    .catch(function(err) {
        ru.handleError(err, req, res);
    });
}

function services(api, req, res) {
    var content = utils.defaultContent('services', req);

    queries
    .create(api, req)
    .doctype('services')
    .doctype('about')
    .doctype('menu')
    .process()
    .then(function(contents) {
        content.common = {};

        var services = contents[0].results[0];
        content.title = utils.getStructuredText(services, 'services.title', 'asHtml');

        var group = services.getGroup('services.services').toArray();
        content.services = [];

        for (var i=0; i<group.length; i++) {
            var service = group[i];
            content.services.push({
                id:         'service_' + i,
                side:       i % 2 === 0 ? 'left' : 'right',
                uid:        service.getText('uid'),
                title:      utils.getStructuredText(service, 'title', 'asHtml'),
                icon:       utils.getImage(service.getImage('icon')),
                photo:      utils.getImage(service.getImage('photo')),
                // excerpt:    utils.getStructuredText(service, 'excerpt', 'asHtml'),
                body:       utils.getStructuredText(service, 'body-text', 'asHtml'),
            });
        }

        var about = contents[1].results[0];
        content.common.about = {
            headline:       about.getText('about.headline'),
            companyname:    about.getText('about.companyname'),
            tagline_text:   utils.getStructuredText(about, 'about.tagline', 'asText'),
            tagline:        utils.getStructuredText(about, 'about.tagline', 'asHtml'),
            content:        utils.getStructuredText(about, 'about.content', 'asHtml'),
            image:          utils.getImage(about.get('about.image'))
        };

        content.menu = chandlers.getMenu(contents[2].results[0]);

        ru.render(res, 'main', 'services', content);
    })

    .catch(function(err) {
        ru.handleError(err, req, res);
    });
}

function about(api, req, res) {
    var content = utils.defaultContent('about', req);

    queries
    .create(api, req)
    .doctype('about')
    .doctype('contact')
    .doctype('menu')
    .process()
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
            var img = utils.getImage(employee.getImage('image'));
            content.common.about.employees.push({
                image:      img,
                has_image:  img.main.url !== '',
                fullname:   utils.getText(employee, 'fullname'),
                telephone:  utils.getText(employee, 'telephone'),
                title:      utils.getText(employee, 'title'),
                email:      utils.emailLink(employee.getText('email')),
                id:         'employee_' + i,
                i:          i
            });
        }

        var clients = about.getGroup('about.clients').toArray();
        content.common.about.clients = [];

        for (var i=0; i<clients.length; i++) {
            var client = clients[i];
            content.common.about.clients.push({
                image:      utils.getImage(client.getImage('image')),
                fullname:   utils.getText(client, 'fullname'),
                i:          i
            });
        }

        var awards = about.getGroup('about.awards').toArray();
        content.common.about.awards = [];

        for (var i=0; i<awards.length; i++) {
            var award = awards[i];

            // Don't have to pass a link resolver when the link
            // is a web link
            var link_web = award.getLink('link');
            link_web = link_web === null ? '' : link_web.url();

            var link_art = award.getLink('related_article');
            link_art = link_art === null
                ? null
                : config.siteUrl(req) + utils.documentLink('work', award);

            content.common.about.awards.push({
                title:              utils.getText(award, 'title'),
                giver:              utils.getText(award, 'giver'),
                year:               award.getNumber('year'),
                link:               link_web,
                related_article:    link_art,
                i:                  i
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

        content.menu = chandlers.getMenu(contents[2].results[0]);

        ru.render(res, 'main', 'about', content);
    })

    .catch(function(err) {
        ru.handleError(err, req, res);
    });
}

function contact(api, req, res) {
    var content = utils.defaultContent('contact', req);

    queries
    .create(api, req)
    .doctype('about')
    .doctype('contact')
    .doctype('menu')
    .process()
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
            map:        utils.getImage(contact.get('contact.map'))
        };

        content.menu = chandlers.getMenu(contents[2].results[0]);

        ru.render(res, 'main', 'contact', content);
    })

    .catch(function(err) {
        ru.handleError(err, req, res);
    });
}

function works(api, req, res) {
    var content = utils.defaultContent('works', req);

    queries
    .create(api, req)
    .doctype('project', {
        pageSize : 50,
        page : 1,
        orderings : '[my.project.published desc]'
    })
    .doctype('about', {
        fetch: [
            'about.companyname'
        ]
    })
    .doctype('contact', {
        fetch: [
            'contact.email',
            'contact.telephone',
            'contact.facebook',
            'contact.instagram',
            'contact.linkedin'
        ]
    })
    .doctype('menu')
    .process()
    .then(function(contents) {
        content.common = {};

        content.projects = chandlers.getProjects(contents[0].results, req);

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

        content.menu = chandlers.getMenu(contents[3].results[0]);

        ru.render(res, 'main', 'projects', content);
    })

    .catch(function(err) {
        ru.handleError(err, req, res);
    });
}

function workOld(api, req, res) {
    api
        .getByID(req.params.id)
        .then(function (doc) {
            res.redirect(301, config.siteUrl(req) + 'work/' + doc.uid + '/');
        })
        .catch(function(err) {
            ru.handleError(err, req, res);
        });
}

function work(api, req, res) {
    var slug = clean(req.params.slug);
    var content = utils.defaultContent('work', req);

    queries
    .create(api, req)
    .predicate('my.project.uid', slug, {
        orderings : '[my.project.published desc]'
    })
    .doctype('about')
    .doctype('contact')
    .doctype('menu')
    .process()
    .then(function(contents) {
        var projects = contents[0].results;

        if (projects.length === 0) {
            return res.redirect(301, '/works');
        }

        var project = projects[0];
        var link = config.siteUrl(req) + utils.documentLink('work', project);

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

        content.menu = chandlers.getMenu(contents[3].results[0]);

        ru.render(res, 'main', 'project', content);
    })

    .catch(function(err) {
        ru.handleError(err, req, res);
    });
}

module.exports.init = function(app) {
    Object.keys(routes).forEach(function(route) {
        app
            .route(route)
            .get(ru.routeHandler(routes[route]));
    });
};
