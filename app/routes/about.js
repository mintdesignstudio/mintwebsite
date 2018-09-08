module.exports = function(req, res, next) {

    let content = {
        page: {
            name: 'about',
            url: 'https://mintdesign.no/about/',
        }
    };

    res.render('about', content);
}
