const Prismic = require('prismic-javascript');
const Promise = require('promise');

module.exports = function(req, res, next) {

    Promise.all([
        req.prismic.api.query(Prismic.Predicates.at('document.type', 'project'), {
            pageSize : 8,
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
        req.prismic.api.query(Prismic.Predicates.any('document.type', [
            'frontpage',
            'about',
            'contact',
            'services'
        ]), {
            ref: res.locals.prismicRef
        }),
    ])
    .then(response => {

        const works = response[0].results;

        let content = {
            page: {
                name: 'frontpage',
                url: res.locals.utils.getPageUrl(req),
            },
            works: works,
        };

        response[1].results.forEach(doc => content[doc.uid] = doc);

        content['heroimage'] = content.frontpage.data.coverimage
            ? content.frontpage.data.coverimage
            : works[0].data.image;

        res.render('frontpage', content);
    })
    .catch(err => {
        console.log('Frontpage error:', err.message);
        next(`Error: ${err.message}`);
    });
}
