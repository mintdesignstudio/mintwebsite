var utils = require('./utils');

module.exports = function(valueObject) {
    return {
        vo: valueObject,
        values: {},

        image: function(prop) {
            this.values[prop] = utils.getImage(this.vo[prop]);
            return this;
        },

        value: function(prop) {
            this.values[prop] = this.vo[prop] ?
                                this.vo[prop].value : '';
            return this;
        },

        asHtml: function(prop) {
            this.values[prop] = this.vo[prop] ?
                                this.vo[prop].asHtml() : '';
            return this;
        },

        email: function(prop) {
            this.values[prop] = this.vo[prop] ?
                                utils.email(this.vo[prop].value) : '';
            return this;
        },

        link: function(prop) {
            this.values[prop] = this.vo[prop] ?
                                utils.link(this.vo[prop].value) : '';
            return this;
        },

        related: function(prop) {
            this.values[prop] = this.vo[prop] ?
                                this.vo[prop].document.slug : '';
            return this;
        },

        set: function(prop, val) {
            this.values[prop] = val;
            return this;
        },

        toObject: function() {
            return this.values;
        }
    };
}
