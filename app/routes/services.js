const Prismic = require('prismic-javascript');

module.exports = function(req, res, next) {

    req.prismic.api.query(Prismic.Predicates.at('document.type', 'services'))
    .then(response => {
        let content = {
            page: {
                name: 'contact',
                url: 'https://mintdesign.no/services/',
            },
            services: response.results[0]
        };

        res.render('services', content);
    })
    .catch(err => {
        console.log('services error:', err.message);
        next(`Error: ${err.message}`);
    });
}
