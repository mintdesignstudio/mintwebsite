const Prismic = require('prismic-javascript');

module.exports = function(req, res, next) {

    req.prismic.api.query(Prismic.Predicates.any('document.type', [
        'about',
        'contact'
    ]), {
        ref: res.locals.prismicRef
    })
    .then(response => {
        let content = {
            page: {
                name: 'about',
                url: res.locals.utils.getPageUrl(req),
            }
        };
        response.results.forEach(doc => content[doc.uid] = doc);
        res.render('about', content);
    })
    .catch(err => {
        next(`Error: ${err.message}`);
    });
}
