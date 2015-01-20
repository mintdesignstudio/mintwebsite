var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var utils           = require('./utils');
var query           = require('./query');

var projects = {
    get: function get(ctx, options, content) {
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
    },

    link: function(project) {
        return '/work/'+project.slug+'/'+project.id;
    }
};

module.exports = projects;

function getProjects(project_list, content) {
    project_list.forEach(function(project, i) {

        content.push({
            i:              i,
            id:             project.id,
            link:           projects.link(project),
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
                console.log(item);
                return utils.getImage(item.image);
            })
        });

        console.log(content[content.length-1].gallery);
    });
}
