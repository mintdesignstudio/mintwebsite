const Prismic = require('prismic-javascript');
const Promise = require('promise');

// recursively fetch all pages
function getPage(api, page, documents) {
    return api.query(Prismic.Predicates.any('document.type', [
        'frontpage',
        'works',
        'project',
        'about',
        'contact',
        'service',
    ]), {
        page: page,
        pageSize: 100,
        fetch: []
    })
    .then((response) => {
        if (response.next_page !== null) {
            return getPage(api, page + 1, documents.concat(response.results));
        }
        return documents.concat(response.results);
    });
}

module.exports = function(req, res, next) {
    getPage(req.prismic.api, 1, [])
    .then((documents) => {
        let body = '';
        documents.forEach((doc) => {
            body += `${req.protocol}://${req.headers.host}${res.locals.ctx.linkResolver(doc)}\r\n`;
        });
        res.send(body);
    })
    .catch((err) => {
        res.status(500).send(`Error: ${err.message}`);
    });
}
