var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var utils           = require('./utils');
var query           = require('./query');
var projects        = require('./projects');
var linkResolver    = require('./linkresolver');

module.exports.get = function get(ctx, content) {
    content = content || {};
    content.common = {};

    return new Promise(function (resolve, reject) {
        getBookmarks(ctx)
        .then(function(bookmarks) {

            aboutPage(bookmarks.about, content.common);
            contactPage(bookmarks.contact, content.common);

            resolve(content.common);

        }, function() {
            reject('Could not get common');
        });
    });
}

function contactPage(contact, common) {
    if (!contact) {
        return;
    }

    common.contact = {
        email:      linkResolver.email(contact.getText('contact.email')),
        telephone:  contact.getText('contact.telephone'),
        address:    contact.getStructuredText('contact.address').asHtml(),
        location:   contact.getGeoPoint('contact.location')
    };
}

function aboutPage(about, common) {
    if (!about) {
        return;
    }

    common.about = {
        headline:       about.getText('about.headline'),
        companyname:    about.getText('about.companyname'),
        tagline_text:   about.getStructuredText('about.tagline').asText(),
        tagline:        about.getStructuredText('about.tagline').asHtml(),
        content:        about.getStructuredText('about.content').asHtml(),
        image:          utils.getImage(about.get('about.image'))
    };

    common.about.employees = utils.iterateGroup({
        document:   about,
        path:       'about.employees'
    }, function(employee, i) {

        return {
            image:      utils.getImage(employee.getImage('image')),
            fullname:   employee.getText('fullname'),
            about:      employee.getStructuredText('about').asHtml(),
            telephone:  employee.getText('telephone'),
            email:      linkResolver.email(employee.getText('email')),
            i:          i
        };

    });

    common.about.clients = utils.iterateGroup({
        document:   about,
        path:       'about.clients'
    }, function(client, i) {

        return {
            image:      utils.getImage(client.getImage('image')),
            fullname:   client.getText('fullname'),
            i:          i
        };

    });

    common.about.awards = utils.iterateGroup({
        document:   about,
        path:       'about.awards'
    }, function(award, i) {

        return {
            title:              award.getText('title'),
            nomination:         award.getText('nomination'),
            year:               award.getNumber('year'),
            link:               award.getText('link'),
            related_article:    linkResolver.document('work', award.getLink('related_article'))
        };

    });
}

function getBookmarks(ctx) {
    var bookmarks = ctx.api.data.bookmarks;

    var lookup = {};
    Object.keys(bookmarks).map(function(name) {
        lookup[bookmarks[name]] = name;
    });

    return new Promise(function (resolve, reject) {
        query(ctx, {
            id: Object.keys(bookmarks).map(function(name) {
                return bookmarks[name];
            })
        })
        .then(function(articles) {
            var documents = {};
            articles.results.forEach(function(article) {
                documents[lookup[article.id]] = article;
            });
            resolve(documents);

        }, function(err) {
            console.log('error: '+err);
            reject(err);
        });
    });
}

