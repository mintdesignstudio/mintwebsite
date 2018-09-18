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

module.exports = function(app) {

    if (config.production) {
        // redirect to https and non-www
        app.get('*', function(req,res,next) {
            let host = req.header('host');

            if (host.substr(0, 9) === 'localhost') {
                next();
                return;
            }

            logger.info('host: ' + host);
            logger.info('x-forwarder-proto: ' + req.headers['x-forwarded-proto']);
            logger.info('match www: ' + host.match(/^www\..*/i));

            let hasWWW = host.match(/^www\..*/i) !== null;

            if (req.headers['x-forwarded-proto'] === 'https' && !hasWWW) {
                logger.info('no redirect necessary');
                next();
                return;
            }

            let domain = hasWWW ? host.substr(4) : host;

            logger.info('redirect to: https://' + domain + req.url);
            res.redirect(301, 'https://' + domain + req.url);
        });
    }

    app.get('/.well-known/acme-challenge/:acmeToken', function(req, res, next) {
        var acmeToken = req.params.acmeToken;
        var acmeKey;

        if (process.env.ACME_KEY && process.env.ACME_TOKEN) {
            if (acmeToken === process.env.ACME_TOKEN) {
                acmeKey = process.env.ACME_KEY;
            }
        }

        for (var key in process.env) {
            if (key.startsWith('ACME_TOKEN_')) {
                var num = key.split('ACME_TOKEN_')[1];
                if (acmeToken === process.env['ACME_TOKEN_' + num]) {
                    acmeKey = process.env['ACME_KEY_' + num];
                }
            }
        }

        if (acmeKey) {
            res.send(acmeKey);
        } else {
            res.status(404).send();
        }
    });

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
