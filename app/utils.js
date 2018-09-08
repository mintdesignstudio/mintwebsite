const config = require('../config.js');

function getPageTitle(about, page, work) {
    let title = `${about.data.companyname} : ${capitalizeFirstLetter(page.name)}`;
    if (page.name === 'work') {
        title += ` : ${work.data.name}`;
    }
    return title;
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function hashName(name) {
    return name
        .toLowerCase()
        .replace(/\s/gi, '');
}

function getPageUrl(req) {
    if (config.development) {
        return req.protocol + '://' + req.hostname + req.originalUrl;
    }
    return 'https://' + req.hostname + req.originalUrl;
}

module.exports = {
    getPageTitle:          getPageTitle,
    capitalizeFirstLetter: capitalizeFirstLetter,
    hashName:              hashName,
    getPageUrl:            getPageUrl,
};



// OLD STUFF ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

// module.exports.getImage = function getImage(img) {
//     return {
//         small:     img ? img.views.small : { url: '' },
//         medium:    img ? img.views.medium : { url: '' },
//         large:     img ? img.views.large : { url: '' },
//         main:      img ? img.main : { url: '' }
//     };
// };

// module.exports.getStructuredText = function(doc, prop, fn) {
//     var txt = doc.getStructuredText(prop);
//     return txt !== null ? txt[fn]() : '';
// };

// module.exports.getText = function(doc, prop, fn) {
//     var txt = doc.getText(prop);
//     return txt !== null ? txt : '';
// };

// module.exports.defaultContent = function(page_name, req) {
//     return {
//         page: {
//             name:   page_name,
//             url:    req.protocol + '://' + req.get('host') + req.originalUrl,
//         }
//     }
// }

// module.exports.ahrefLink = function(url, label) {
//     return url ? '<a href="'+url+'">'+label+'</a>' : null;
// }

// module.exports.emailLink = function(value) {
//     return value ? '<a href="mailto:'+value+'">'+value+'</a>' : '';
// }

// // Accepts a Prismic document and a url type.
// // Uses the route definition to map document fragments to url params, and
// // gets the domain name from config to output full urls.
// // For route '/project/:slug/:id', the link resolver will output the
// // domain name, append 'project' since it isn't a variable, and for each
// // param that starts with a :, it will try to get it from the document. For
// // optional params, that starts with ?, it will check if the document has
// // a property with the same name.

// // TODO: The resolver should implement better checking and error reporting for
// // required params (the ones that start with ':').
// module.exports.documentLink = function(type, doc) {
//     if (doc) {
//         var url = config.routes[type].split('/');

//         url = url.map(function(param) {
//             if (param.charAt(0) === ':') {
//                 return doc[param.slice(1)];
//             }

//             if (param.charAt(0) === '?') {
//                 if (typeof doc[param.slice(1)] !== 'undefined') {
//                     return doc[param.slice(1)];
//                 }
//             }

//             return param;
//         });

//         return url.join('/').substring(1);
//     }

//     return null;
// }
