var Prismic         = require('prismic.io').Prismic;
var Promise         = require('promise');
var config          = require('../config');
var common          = require('./modules/common');
var app             = require('./app');

var threeHours = 60 * 60 * 3 * 1000;

// Router middleware that adds a Prismic context to the res object
module.exports.prismic = function(req, res, next) {
    Prismic.Api(config.apiEndpoint, function(err, Api) {
        if (err) {
            console.log('prismic middleware ERROR');
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
            }
        };

        res.locals.ctx = ctx;
        next();

    }, config.accessToken);
};

module.exports.construction = function(req, res, next) {

    if (!config.construction) {
        next();
        return;
    }

    // Check query param
    if (req.query.bypass === 'true') {
        res.cookie('in_dev', true, {
            maxAge: threeHours,
            httpOnly: true
        });
        next();
        return;
    }

    // Bypass due to cookie
    if (req.cookies.in_dev === 'true') {
        next();
        return;
    }

    var content = {};

    // console.log(res.locals.ctx.api.data.bookmarks);

    // res.locals.ctx.api.form('everything')
    //     .ref(res.locals.ctx.ref)
    //     .query(Prismic.Predicates.at('document.type', 'project'))
    //     .pageSize(100)
    //     .submit(function(err, response) {
    //         if (err) {
    //             res.send('Common error '+err);
    //         }
    //         res.send(response);
    //     });

    common.get(res.locals.ctx, content)
    .then(function(results) {
        app.render(res, 'construction', 'construction', content);

    }, function() {
        res.send('Home error');
    });

    // return;
};
