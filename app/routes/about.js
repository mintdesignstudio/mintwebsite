module.exports = function(req, res, next) {

    let content = {
        page: {
            name: 'about',
            url: res.locals.utils.getPageUrl(req),
        }
    };
    res.render('about', content);
}
