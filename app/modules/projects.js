var Promise         = require('promise');
var Prismic         = require('prismic.io').Prismic;
var fragments       = require('./fragments');
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
            projects.results.forEach(function(project, i) {

                content.projects.push({
                    i:      i,
                    image:  fragments.getImage(project.get('project.image')),

                    gallery: fragments.iterateGroup({
                        document:   project,
                        path:       'project.gallery'
                    }, function(item, i) {

                        return fragments.getImage(item.image);

                    }),

                    name:           project.getText('project.name'),
                    description:    project.getText('project.description'),
                    body:           project
                                        .getStructuredText('project.body')
                                        .asHtml(),
                    slug:           project.slug,
                    slugs:          project.slugs
                });

            });
            resolve(content.projects);

        }, function(reason) {
            reject(reason);
        });

    });
}
