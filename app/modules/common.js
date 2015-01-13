var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var utils           = require('./utils');
var query           = require('./query');
var values          = require('./values');

module.exports.get = function get(ctx, content) {
    content = content || {};
    var common = content.common = {};

    return new Promise(function (resolve, reject) {
        getBookmarks(ctx)
        .then(function(bookmarks) {

            aboutPage(bookmarks.about, common);
            contactPage(bookmarks.contact, common);

            resolve(content.common);

            common = null;

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
        email:      utils.email(contact.getText('contact.email')),
        telephone:  contact.getText('contact.telephone'),
        address:    contact.getText('contact.address'),
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
        tagline:        about.getStructuredText('about.tagline').asHtml(),
        content:        about.getStructuredText('about.content').asHtml(),
        image:          utils.getImage(about.get('about.image'))
    };

    common.about.employees = utils.iterateGroup({
        document:   about,
        path:       'about.employees'
    }, function(employee, i) {

        return values(employee)
            .image('image')
            .value('fullname')
            .asHtml('about')
            .value('telephone')
            .email('email')
            .set('i', i)
            .toObject();

    });

    common.about.clients = utils.iterateGroup({
        document:   about,
        path:       'about.clients'
    }, function(client, i) {

        return values(client)
            .image('image')
            .value('fullname')
            .set('i', i)
            .toObject();

    });

    common.about.awards = utils.iterateGroup({
        document:   about,
        path:       'about.awards'
    }, function(award, i) {

        return values(award)
            .value('title')
            .value('nomination')
            .value('year')
            .link('link')
            .related('related_article')
            .toObject();

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

