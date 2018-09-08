const Prismic = require('prismic-javascript');

module.exports = function(req, res, next) {

    req.prismic.api.query(Prismic.Predicates.any('document.type', [
        'services',
        'contact',
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

        res.render('services', content);
    })
    .catch(err => {
        console.log('services error:', err.message);
        next(`Error: ${err.message}`);
    });
}
