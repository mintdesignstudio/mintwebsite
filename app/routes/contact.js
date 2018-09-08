module.exports = function(req, res, next) {

    let content = {
        page: {
            name: 'contact',
            url: 'https://mintdesign.no/contact/',
        }
    };

    res.render('contact', content);
}
