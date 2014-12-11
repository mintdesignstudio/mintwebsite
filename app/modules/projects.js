var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var utils           = require('./utils');
var query           = require('./query');

module.exports.get = function get(ctx, limit, sort, content) {
    content = content || {};
    content.projects = [];
    limit = limit || undefined;
    sort = sort ? '[my.project.'+sort+']' : undefined;

    return new Promise(function (resolve, reject) {

        query(ctx, {
            type:  'project',
            limit: limit,
            sort:  sort
        })

        .then(function(projects) {

            getProjects(projects.results, content.projects);
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
            image:          utils.getImage(project.get('project.image')),
            name:           project.getText('project.name'),
            description:    project.getText('project.description'),
            body:           project.getStructuredText('project.body').asHtml(),
            slug:           project.slug,
            slugs:          project.slugs,

            gallery:        utils.iterateGroup({
                document:   project,
                path:       'project.gallery'
            }, function(item, i) {
                return utils.getImage(item.image);
            })

        });

    });
}
