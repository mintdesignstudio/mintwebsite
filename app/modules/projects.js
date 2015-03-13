var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var utils           = require('./utils');
var query           = require('./query');
var linkResolver    = require('./linkresolver');

module.exports.get = function(ctx, options, content) {
    content = content || {};
    content.projects = [];

    options = options || {};
    if (!options.id) {
        options.type = 'project';
    }
    options.limit = options.limit || undefined;
    options.sort = options.sort ?
                   '[my.project.'+options.sort+']' :
                   undefined;

    return new Promise(function (resolve, reject) {

        query(ctx, options)
        .then(function(project_list) {

            getProjects(project_list.results, content.projects);
            resolve(content.projects);

        }, function(reason) {
            reject(reason);
        });

    });
}

function getProjects(project_list, content) {
    project_list.forEach(function(project, i) {

        content.push({
            i:              i,
            id:             project.id,
            link:           linkResolver.document('work', project),
            image:          utils.getImage(project.get('project.image')),
            name:           project.getText('project.name'),
            description:    project.getText('project.description'),
            og_description: project.getStructuredText('project.body').getFirstParagraph().text,
            body:           project.getStructuredText('project.body').asHtml(),
            slug:           project.slug,
            slugs:          project.slugs,

            gallery:        utils.iterateGroup({
                document:   project,
                path:       'project.gallery'
            }, function(doc, i) {
                return utils.getImage(doc.getImage('image'));
            })
        });
    });
}
