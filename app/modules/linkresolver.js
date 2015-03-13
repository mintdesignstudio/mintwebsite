var config          = require('../../config');

module.exports.ahref = function(url) {
    return url ? '<a href="'+url+'">'+url+'</a>' : null;
}

module.exports.email = function(value) {
    return value ? '<a href="mailto:'+value+'">'+value+'</a>' : '';
}

// Accepts a Prismic document and a url type.
// Uses the route definition to map document fragments to url params, and
// gets the domain name from config to output full urls.
// For route '/project/:slug/:id', the link resolver will output the
// domain name, append 'project' since it isn't a variable, and for each
// param that starts with a :, it will try to get it from the document. For
// optional params, that starts with ?, it will check if the document has
// a property with the same name.

// TODO: The resolver should implement better checking and error reporting for
// required params (the ones that start with ':').
module.exports.document = function(type, doc) {
    if (doc) {
        var url = config.routes[type].split('/');

        url = url.map(function(param) {
            if (param.charAt(0) === ':') {
                return doc[param.slice(1)];
            }

            if (param.charAt(0) === '?') {
                if (typeof doc[param.slice(1)] !== 'undefined') {
                    return doc[param.slice(1)];
                }
            }

            return param;
        });

        return config.url('base') + url.join('/');
    }

    return null;
}
