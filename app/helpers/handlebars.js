var Handlebars = require('handlebars');
var config = require('../../config');

module.exports.img = function(image, size) {
    if (typeof image === 'undefined') {
        return '';
    }
    if (image[size].url === '') {
        return '';
    }
    return new Handlebars.SafeString(
        '<img src="' + image[size].url + '" />'
    );
}

module.exports.background = function(id, image) {
    return new Handlebars.SafeString(
        '<style type="text/css">' +
        '#' + id + ' {'+
            'background-image: url(' + image.small.url + ');'+
        '}' +
        '@media screen and (min-width: 40em) and (max-width: 60em) {' +
            '#' + id + '{' +
                'background-image: url(' + image.medium.url + ');' +
            '}' +
        '}' +
        '@media screen and (min-width: 60em) and (max-width: 80em) {' +
            '#' + id + '{' +
                'background-image: url(' + image.large.url + ');' +
            '}' +
        '}' +
        '@media screen and (min-width: 80em) {' +
            '#' + id + '{' +
                'background-image: url(' + image.main.url + ');' +
            '}' +
        '}' +
        '</style>'
    );
}

module.exports.herobg = function(id, image, size) {
    return new Handlebars.SafeString(
        '<style type="text/css">' +
        '#' + id + ' {'+
            'background-image: url(' + image[size].url + ');'+
        '}' +
        '</style>'
    );
}

module.exports.first = function(context, options) {
    return options.fn(context[0]);
}

module.exports.capitalize = function(options) {
    var str = options.fn(this);
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Add a helper for each route. A route for e.g. the about page will
// get a helper called isAbout. Pass the page property to isXxx to evaluate
// the page name.
Object.keys(config.routes).forEach(function(page) {
    module.exports['is' + page.charAt(0).toUpperCase() + page.slice(1)] = isPage(page);
});

function isPage(page) {
    return function(context, options) {
        if (context === page) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    }
}
