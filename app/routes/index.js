const Prismic      = require('prismic-javascript');
const prismicDOM   = require('prismic-dom');
const Cookies      = require('cookies');

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
        app.get('*',function(req,res,next) {
            if (req.headers['x-forwarded-proto'] !== 'https') {
                res.redirect(301, 'https://' + req.headers.host + req.url);
            } else {
                next();
            }
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

    // Get the menu with every route
    app.route('*').get((req, res, next) => {
        req.prismic.api.getSingle('menu')
        .then(menu => {
            res.locals.menu = menu;
            next();
        }).catch((error) => {
            console.log('could not get menu:',error.message);
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
