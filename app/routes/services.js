const Prismic = require('prismic-javascript');

module.exports = function(req, res, next) {

    req.prismic.api.query(Prismic.Predicates.any('document.type', [
        'services',
        'about'
    ]), {
        ref: res.locals.prismicRef
    })
    .then(response => {
        let content = {
            page: {
                name: 'contact',
                url: res.locals.utils.getPageUrl(req),
            }
        };
        response.results.forEach(doc => content[doc.uid] = doc);

        res.render('contact', content);
    })
    .catch(err => {
        next(`Error: ${err.message}`);
    });
}
