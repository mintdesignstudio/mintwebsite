var Prismic = require('prismic-nodejs');

function Queries() {};

Queries.prototype.doctype = function(doctype, options) {
    var cookies = this.req.cookies;
    var api = this.api;
    var opt = options || {};

    this.promises.push(this.api.query([
        Prismic.Predicates.at('document.type', doctype)
    ], Object.assign(opt, {
        ref: cookies[Prismic.previewCookie] || api.master()
    })));
    return this;
};

Queries.prototype.predicate = function(predicate, value, options) {
    var cookies = this.req.cookies;
    var api = this.api;
    var opt = options || {};

    this.promises.push(this.api.query([
        Prismic.Predicates.at(predicate, value)
    ], Object.assign(opt, {
        ref: cookies[Prismic.previewCookie] || api.master()
    })));
    return this;
};

Queries.prototype.process = function() {
    return Promise.all(this.promises);
};

module.exports.create = function(_api, _req) {
    return Object.create(Queries.prototype, {
        api: {
            value: _api,
            enumerable: false,
            writable: false,
        },
        req: {
            value: _req,
            enumerable: false,
            writable: false,
        },
        promises: {
            value: [],
            enumerable: true,
        }
    });
};
