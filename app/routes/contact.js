module.exports = function(req, res, next) {

    let content = {
        page: {
            name: 'contact',
            url: res.locals.utils.getPageUrl(req),
        }
    };

    res.render('contact', content);
}
