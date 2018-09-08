const Prismic = require('prismic-javascript');

module.exports = function(req, res, next) {

    req.prismic.api.getByUID('project', req.params.uid)
    .then(response => {

        let content = {
            page: {
                name: 'work',
                url: 'https://mintdesign.no/work/'+req.params.uid,
            },
            work: response,
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
