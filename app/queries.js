var Prismic         = require('prismic-nodejs');

function Queries() {};

Queries.prototype.doctype = function(doctype, options) {
    this.promises.push(this.api.query([
        Prismic.Predicates.at('document.type', doctype)
    ], options));
    return this;
};

Queries.prototype.predicate = function(predicate, value, options) {
    this.promises.push(this.api.query([
        Prismic.Predicates.at(predicate, value)
    ], options));
    return this;
};

Queries.prototype.process = function() {
    return Promise.all(this.promises);
};

module.exports.create = function(_api) {
    return Object.create(Queries.prototype, {
        api: {
            value: _api,
            enumerable: true,
            writable: true,
        },
        promises: {
            value: [],
            enumerable: true,
        }
    });
};
