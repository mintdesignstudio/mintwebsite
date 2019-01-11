const Prismic      = require('prismic-javascript');
const prismicDOM   = require('prismic-dom');
const logger       = require('heroku-logger');

const linkResolver = require('../link-resolver');
const utils        = require('../utils');
const config       = require('../../config.js');

const frontpage    = require('./frontpage');
const about        = require('./about');
const contact      = require('./contact');
const works        = require('./works');
const work         = require('./work');
const services     = require('./services');
const preview      = require('./preview');
const sitemap      = require('./sitemap');
const https        = require('./https');
const acme         = require('./acme');

module.exports = function(app) {

    https(app);
    acme(app);

    // Middleware to inject prismic context
    app.use((req, res, next) => {
        res.locals.ctx = {
            endpoint: config.apiEndpoint,
            linkResolver: linkResolver,
        };

        // add prismicDOM in locals to access them in templates.
        res.locals.prismicDOM = prismicDOM;

        // add template helpers
        res.locals.utils = utils;

        Prismic.api(config.apiEndpoint, {
            accessToken: config.accessToken,
            req,
        }).then((api) => {
            req.prismic = { api };
            console.log('Got Prismic API with ref: '+res.locals.prismicRef);
            next();
        }).catch((error) => {
            next(error.message);
        });
    });

    // Add getCanonicalUrl function in locals
    app.use(function (req, res, next) {
        res.locals.getCanonicalUrl = (doc) => {
            return 'https://' + req.headers.host + res.locals.ctx.linkResolver(doc);
        };
        next();
    });

    // Get the about and contact pages with every route
    app.route('*').get((req, res, next) => {
        req.prismic.api.query(Prismic.Predicates.any('document.type', [
            'about',
            'contact',
            'menu'
        ]), {
            ref: res.locals.prismicRef
        })
        .then(response => {
            response.results.forEach(doc => res.locals[doc.uid] = doc);
            next();
        }).catch((error) => {
            console.log('could not get menu, about or contact:',error.message);
            next(error.message);
        });
    });

    app.get('/',                frontpage);
    app.get('/about',           about);
    app.get('/contact',         contact);
    app.get('/works',           works);
    app.get('/work/:uid/',      work);
    app.get('/services',        services);
    app.get('/preview',         preview);
    app.get('/sitemap.txt',     sitemap);
}
