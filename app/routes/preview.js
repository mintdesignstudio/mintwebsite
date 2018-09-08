const Cookies = require('cookies');
const Prismic = require('prismic-javascript');

module.exports = function(req, res, next) {
    const previewToken = req.query['token'];
    req.prismic.api.previewSession(previewToken,
                                   res.locals.ctx.linkResolver,
                                   '/',
                                   (err, redirectUrl) => {
        res.cookie(Prismic.previewCookie, previewToken, {
            maxAge: 60 * 30 * 1000,
            path: '/',
            httpOnly: false
        });
        res.redirect(redirectUrl);
    });
}
