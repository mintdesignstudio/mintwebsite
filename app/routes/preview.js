const Cookies = require('cookies');
const Prismic = require('prismic-javascript');
const logger  = require('heroku-logger');

module.exports = async (req, res, next) => {

    const { token, documentId } = req.query;

    if (!token) {
        res.send(400, 'Missing token for querystring');
        return;
    }

    const redirectUrl = await req.prismic.api
        .getPreviewResolver(token, documentId)
        .resolve(res.locals.ctx.linkResolver, '/');
    
    const cookies = new Cookies(req, res);
    cookies.set(Prismic.previewCookie, token, {
        maxAge: 30 * 60 * 1000,
        path: '/',
        httpOnly: false
    });

    console.log('Preview redirects to url: '+redirectUrl);

    res.redirect(302, redirectUrl);
}
