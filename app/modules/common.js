var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var fragments       = require('./fragments');
var query           = require('./query');

module.exports.get = function get(ctx, content) {
    content = content || {};
    var common = content.common = {};

    return new Promise(function (resolve, reject) {
        getBookmarks(ctx)
        .then(function(bookmarks) {

            var about = bookmarks.about;
            if (about) {
                common.about = {
                    headline:       about.getText('about.headline'),
                    companyname:    about.getText('about.companyname'),
                    tagline:        about.getText('about.tagline'),
                    content:        about
                                        .getStructuredText('about.content')
                                        .asHtml(),
                    image:          fragments
                                        .getImage(about.get('about.image'))
                };

                common.about.employees = fragments.iterateGroup({
                    document:   about,
                    path:       'about.employees'
                }, function(employee, i) {

                    return {
                        image:      fragments.getImage(employee.image),
                        fullname:   employee.fullname.value,
                        about:      employee.about.asHtml(),
                        telephone:  employee.telephone.value,
                        email:      fragments.email(employee.email.value),
                        i:          i
                    };

                });

                common.about.clients = fragments.iterateGroup({
                    document:   about,
                    path:       'about.clients'
                }, function(client, i) {

                    return {
                        image:      fragments.getImage(client.image),
                        fullname:   client.fullname.value,
                        i:          i
                    };

                });

                common.about.awards = fragments.iterateGroup({
                    document:   about,
                    path:       'about.awards'
                }, function(award, i) {

                    var aw = {
                        title:              award.title.value,
                        nomination:         award.nomination.value,
                        year:               award.year.value,
                        link:               fragments.link(award.link.value)
                    };

                    if (award.related_article) {
                        aw.related_article = award.related_article.document;
                    }

                    return aw;

                });
            }

            var contact = bookmarks.contact;
            if (contact) {
                content.common.contact = {
                    email:      fragments.email(contact.getText('contact.email')),
                    telephone:  contact.getText('contact.telephone'),
                    address:    contact.getText('contact.address'),
                    location:   contact.getGeoPoint('contact.location')
                };
            }

            resolve(content.common);

            contact = null;
            about = null;
            common = null;

        }, function() {
            reject('Could not get common');
        });
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
