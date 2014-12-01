var gulp            = require('gulp');
var imagemin        = require('gulp-imagemin');
var inlinesource    = require('gulp-inline-source');
var minifyCSS       = require('gulp-minify-css');
var minifyHTML      = require('gulp-minify-html');

// Check the environment vars to make sure the tasks don't run on
// install locally. Gulp is set to run on postinstall. Heroku changes
// the environment variable to 'production' when deploying.

var prod = process.env.NODE_ENV === 'production';

gulp.task('svgmin', function() {
    if (!prod) {
        return null;
    }
    gulp.src('public/images/*.svg')
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
    if (!prod) {
        return null;
    }
    gulp.src('app/views/layouts/*.hbs')
        .pipe(inlinesource())
        .pipe(gulp.dest('app/views/layouts'));
});

gulp.task('minicss-app', function() {
    if (!prod) {
        return null;
    }
    gulp.src('./app/views/css/*.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest('./app/views/css/'));
});

gulp.task('minicss-public', function() {
    if (!prod) {
        return null;
    }
    gulp.src('./public/*.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest('./public/'));
});

gulp.task('minify-html', function() {
    if (!prod) {
        return null;
    }
    var opts = {
        empty: true,
        conditionals: true,
        spare: true,
        quotes: true
    };

    gulp.src('./app/views/**/*.hbs')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest('./app/views/'))
});

gulp.task('default', [
    'minicss-app',
    'inline',
    'svgmin',
    'minicss-public',
    'minify-html'
], function() {});
