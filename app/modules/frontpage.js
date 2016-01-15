var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var utils           = require('./utils');
var query           = require('./query');
var linkResolver    = require('./linkresolver');

module.exports.get = function get(ctx, content) {
    content = content || {};
    content.frontpage = {};

    return new Promise(function (resolve, reject) {
        getBookmarks(ctx)
        .then(function(bookmarks) {

            content.frontpage = frontpage(bookmarks.frontpage);
            resolve(content.frontpage);

        }, function() {
            reject('Could not get frontpage');
        });
    });
}

function frontpage(page) {
    if (!page) {
        return;
    }

    return {
        coverimage: utils.getImage(page.get('frontpage.coverimage'))
    };
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

