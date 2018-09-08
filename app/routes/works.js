const Prismic = require('prismic-javascript');

module.exports = function(req, res, next) {

    req.prismic.api.query(Prismic.Predicates.at('document.type', 'project'), {
        pageSize : 50,
        page : 1,
        orderings : '[my.project.published desc]',
        fetch: [
            'project.uid',
            'project.image',
            'project.name',
            'project.description',
        ],
        ref: res.locals.prismicRef
    })
    .then(response => {

        let content = {
            page: {
                name: 'works',
                url: 'https://mintdesign.no/works/',
            },
            works: response.results
        };

        res.render('works', content);
    })
    .catch(err => {
        next(`Error: ${err.message}`);
    });
}
