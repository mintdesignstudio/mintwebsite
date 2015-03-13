module.exports.first = function(context, options) {
    return options.fn(context[0]);
}
