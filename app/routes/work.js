const Prismic = require('prismic-javascript');
const Promise = require('promise');

module.exports = function(req, res, next) {

    const api = req.prismic.api;

    Promise.all([
        api.getByUID('project', req.params.uid),
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
                name: 'work',
                url: res.locals.utils.getPageUrl(req),
            },
            work:    response[0],
            about:   response[1].results[0],
            contact: response[2].results[0],
        };

        content.work.data.gallery = content.work.data.gallery.map(entry => {
            return entry.image;
        });

        res.render('work', content);
    })
    .catch(err => {
        next(`Error: ${err.message}`);
    });
}
