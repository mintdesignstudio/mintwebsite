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
