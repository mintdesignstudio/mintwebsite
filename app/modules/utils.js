var Prismic         = require('prismic.io').Prismic;
var config          = require('../../config');

module.exports.getImage = function getImage(img) {
    return {
        small:     img ? img.views.small.url : '',
        medium:    img ? img.views.medium.url : '',
        large:     img ? img.views.large.url : '',
        main:      img ? img.main.url : '',
        alt:       img ? img.main.alt : ''
    };
}

module.exports.email = function email(value) {
    return value ? '<a href="mailto:'+value+'">'+value+'</a>' : '';
}

module.exports.link = function link(value) {
    return value ? '<a href="'+value+'">'+value+'</a>' : '';
}

module.exports.iterateGroup = function iterateGroup(options, cb) {
    options = options || undefined;

    if (!options) {
        console.log("Cannot iterate group without options");
        return;
    }

    if (!options.document) {
        console.log("Group iterator missing document reference");
        return;
    }

    if (!options.path) {
        console.log("Group iterator missing path to group");
        return;
    }

    if (typeof cb !== 'function') {
        console.log('Group iterator callback must be a function');
        return;
    }

    var group = options.document.getGroup(options.path);
    var docs = group ? group.toArray() : [];
    return docs.map(function(item, i) {
        return cb(item, i);
    });
    group = null;
    docs = null;
    return [];
}

module.exports.defaultContent = function(page_name) {
    return {
        page: {
            name:   page_name,
            url:    config.url('base') + config.routes[page_name]
        }
    }
}
