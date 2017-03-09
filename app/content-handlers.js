var utils           = require('./utils.js');
var putils          = require('../prismic-utils');

var handlers = {};

handlers.getClients = function(about, max_clients, req) {
    var clients = about.getGroup('about.clients').toArray();
    var results = [];

    max_clients = clients.length < max_clients
        ? clients.length
        : max_clients;

    for (var i=0; i<max_clients; i++) {
        var client = clients[i];
        results.push({
            image: utils.getImage(client.getImage('image')),
        });
    }

    return results;
};

handlers.getAbout = function(results, req) {
    return {
        headline:       results.getText('about.headline'),
        companyname:    results.getText('about.companyname'),
        tagline_text:   utils.getStructuredText(results, 'about.tagline', 'asText'),
        tagline:        utils.getStructuredText(results, 'about.tagline', 'asHtml'),
        content:        utils.getStructuredText(results, 'about.content', 'asHtml'),
        image:          utils.getImage(results.get('about.image'))
    };
}

handlers.getProjects = function(results, req) {
    var projects = [];

    for (var i=0; i<results.length; i++) {
        var p = results[i];
        projects.push({
            i:              i,
            id:             p.id,
            link:           config.siteUrl(req)
                            + utils.documentLink('work', p),
            image:          utils.getImage(p.getImage('project.image')),
            name:           p.getText('project.name'),
            description:    p.getText('project.description'),
        });
    }

    return projects;
}

handlers.getMenu = function(contents) {
    var options = contents.getGroup('menu.options').toArray();
    var menu = [];

    for (var i=0; i<options.length; i++) {
        var option = options[i];
        menu.push({
            link:   utils.ahrefLink(
                        option.getLink('link').url(putils.linkResolver),
                        utils.getText(option, 'label')
                    ),
        });
    }

    return menu;
}


module.exports = handlers;
