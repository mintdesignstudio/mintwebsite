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
    })
    .then(response => {

        let content = {
            page: {
                name: 'works',
                url: 'https://mintdesign.no/works/',
            },
            projects: response.results
        };

        req.prismic.api.query(Prismic.Predicates.at('document.type', 'works'))
        .then(response => {
            res.locals.works = response.results[0];
            res.render('works', content);
        })
    })
    .catch(err => {
        next(`Error: ${err.message}`);
    });
}
