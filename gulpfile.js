var gulp            = require('gulp');
var imagemin        = require('gulp-imagemin');
var inlinesource    = require('gulp-inline-source');

var dev = process.env.NODE_ENV !== 'production';

// minify png, jpg, gif, svg
// minify html, css
// uglify js

gulp.task('svgmin', function() {
    if (dev) {
        return null;
    }
    return gulp.src('public/images/*.svg')
        .pipe(imagemin({
            svgoPlugins: [
                {removeViewBox: true},
                {removeEmptyAttrs: true},
                {removeEmptyContainers: true},
                {removeEmptyText: true},
                {removeHiddenElems: true},
                {removeMetadata: true},
                {removeRasterImages: true},
                {removeUselessStrokeAndFill: true},
                {cleanupAttrs: true},
                {removeComments: true},
                {removeDesc: true},
                {removeDoctype: true}
            ]
        }))
        .pipe(gulp.dest('public/images'));
});

gulp.task('inline', function() {
    if (dev) {
        return null;
    }
    return gulp.src('app/views/layouts/*.hbs')
        .pipe(inlinesource())
        .pipe(gulp.dest('app/views/layouts'));
});

gulp.task('default', ['svgmin', 'inline'], function() {

});
