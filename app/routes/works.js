const Prismic = require('prismic-javascript');
const Promise = require('promise');

module.exports = function(req, res, next) {

    const api = req.prismic.api;

    Promise.all([
        api.query(Prismic.Predicates.at('document.type', 'project'), {
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
        }),

        api.query(Prismic.Predicates.at('document.type', 'about'), {
            ref: res.locals.prismicRef
        }),

        api.query(Prismic.Predicates.at('document.type', 'contact'), {
            ref: res.locals.prismicRef
        }),
    ])
    .then(response => {

        let content = {
            page: {
                name: 'works',
                url: res.locals.utils.getPageUrl(req),
            },
            works:   response[0].results,
            about:   response[1].results[0],
            contact: response[2].results[0],
        };

        res.render('works', content);
    })
    .catch(err => {
        next(`Error: ${err.message}`);
    });
}
