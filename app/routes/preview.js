const Cookies = require('cookies');
const Prismic = require('prismic-javascript');

module.exports = function(req, res, next) {

    const token = req.query.token;

    if (!token) {
        res.send(400, 'Missing token for querystring');
    }

    req.prismic.api.previewSession(token, res.locals.ctx.linkResolver, '/')
    .then((url) => {
        const cookies = new Cookies(req, res);
        cookies.set(Prismic.previewCookie, token, {
            maxAge: 30 * 60 * 1000,
            path: '/',
            httpOnly: false
        });

        // For Prismic preview.
        // Figure out the correct ref to use
        const previewRef = cookies.get(Prismic.previewCookie);
        const masterRef = req.prismic.api.refs.find(ref => {
            return ref.isMasterRef === true;
        });
        res.locals.prismicRef = previewRef || masterRef.ref;

        res.redirect(302, url);
    })
    .catch((error) => {
        console.log('preview error:', error.message);
        next(error.message);
    });
}
