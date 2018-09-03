var fs              = require('fs');
var path            = require('path');
var fse             = require('fs-extra');
var klawSync        = require('klaw-sync');
var morecss         = require('more-css');
var Minimize        = require('minimize');
var UglifyJS        = require('uglify-js');
var cheerio         = require('cheerio');
var sri             = require('node-sri');
var Promise         = require('promise');
const { inlineSource }  = require('inline-source');
const imagemin          = require('imagemin');
const imageminPngquant  = require('imagemin-pngquant');
const imageminSvgo      = require('imagemin-svgo');

var dir = {
    prod:           __dirname + '/production/',
    pub:            __dirname + '/public/',
    prodpub:        __dirname + '/production/public/',
    appview:        __dirname + '/app/views/',
    appcss:         __dirname + '/app/views/css/',
    prodappview:    __dirname + '/production/app/views/',
    prodappcss:     __dirname + '/production/app/views/css/'
};

// -----------------------------------------------------------------------------

cleanCopyDir(dir.pub, dir.prodpub, function() {
    console.log('Copy '+dir.prodpub);

    cleanCopyDir(dir.appview, dir.prodappview, function() {
        console.log('Copy '+dir.prodappview);

        minifyCss(dir.prod);
        uglify(dir.prodpub + 'js/');
        sriHash(dir.prodappview + 'layouts/', '.hbs');
        inlineAll();
        svgmin();
        pngmin();
        htmlmin(dir.prodappview, '.hbs');
    });
});


// -----------------------------------------------------------------------------

function uglify(dir) {
    console.log('Uglify JS');

    var files = listFiles(dir, '.js')
        .map(function(file) {
            console.log('    '+file.path);
            return file.path;
        });

    files.forEach(function(file) {
        var content = UglifyJS.minify(file);
        fs.writeFileSync(file, content.code);
    });

    console.log('');
}

function sriHash(dirname, ext) {
    console.log('Create SRI hash for external resources');

    var modified = {};
    var promises = [];
    var sources = [];

    var files = listFiles(dirname, ext)
        .map(function(file) {
            console.log('    '+file.path);
            return file.path;
        });

    files.forEach(function(file) {
        var content = fs.readFileSync(file, 'utf8');
        var $ = cheerio.load(content);

        modified[file] = $;

        $('script').each(function(i, script) {
            var co = $(this).attr('crossorigin');
            if (typeof co === 'undefined') {
                return;
            }

            var src = $(this).attr('src');
            if (src[0] === '/' && src[1] !== '/') {
                sources.push(src);
                promises.push(sri.hash({
                    file: dir.prod.substring(0, dir.prod.length-1) + src,
                    algo: 'sha256'
                }));
            }
        });
    });

    Promise.all(promises)
        .then(function (res) {

            Object.keys(modified).forEach(function(file) {
                var $ = modified[file];
                $('script').each(function(i, script) {
                    var src = $(this).attr('src');
                    var si = sources.indexOf(src);
                    if (si < 0) {
                        return;
                    }
                    var hash = res[si];

                    $(this).attr('integrity', hash);
                });

                fs.writeFileSync(file, $.html());
            });

            console.log('');
        });
}

function htmlmin(dir, ext) {
    console.log('HTMLMin');

    minimize = new Minimize({
        empty: true,        // KEEP empty attributes
        cdata: true,        // KEEP CDATA from scripts
        comments: false,    // KEEP comments
        ssi: false,         // KEEP Server Side Includes
        conditionals: true, // KEEP conditional internet explorer comments
        spare: true,        // KEEP redundant attributes
        quotes: true,       // KEEP arbitrary quotes
        loose: false        // KEEP one whitespace
    });

    var files = listFiles(dir, ext)
        .map(function(file) {
            console.log('    '+file.path);
            return file.path;
        });

    files.forEach(function(file) {
        var content = fs.readFileSync(file, 'utf8');
        minimize.parse(content, function (error, data) {
            fs.writeFileSync(file, data);
        });
    });

    console.log('');
}

async function svgmin() {
    await imagemin([dir.prodpub + 'images/*.svg'],
             dir.prodpub + 'images',
             { use: [
                imageminSvgo({
                    plugins: [
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
                })
            ]});
    console.log('SVGs optimized');
}

async function pngmin() {
    await imagemin([dir.prodpub + 'images/*.png'],
         dir.prodpub + 'images/',
         {use: [imageminPngquant({
            quality: '80',
         })]})
    console.log('PNGs optimized');
}

function inlineAll() {
    let files = listFiles(dir.prodappview + 'layouts/', '.hbs')
        .map((file) => {
            return file.path;
        });

    files.forEach((file) => {
        inline(file);
    });
    console.log('Inlined sources');
}

async function inline(file) {
    let html = await inlineSource(file, {
        compress: false,
        swallowErrors: false,
        rootpath: path.resolve('production/')
    });
    fs.writeFileSync(file, html);
}

function minifyCss(dir) {
    console.log('Minify CSS');
    var css_files = listFiles(dir, '.css')
        .map(function(file) {
            console.log('    '+file.path);
            return file.path;
        });

    css_files.forEach(function(file) {
        var source = fs.readFileSync(file, 'utf8');
        var minified = morecss.compress(source, true);
        fs.writeFileSync(file, minified);
    });
    console.log('');
}

function listFiles(dir, ext) {
    return klawSync(dir, {nodir: true}).filter(function(file) {
        return path.extname(file.path) === ext;
    });
}

function cleanCopyDir(from, to, cb) {
    removeDir(to, function() {
        copyDir(from, to, cb);
    });
}

function removeDir(dir, cb) {
    fse.remove(dir, function(err) {
        if (err) {
            return console.error('[ERROR REMOVE]', err);
        }
        if (typeof cb !== 'undefined') {
            cb();
        }
    });
}

function copyDir(from_dir, to_dir, cb) {
    fse.copy(from_dir, to_dir, function (err) {
        if (err) {
            return console.error('[ERROR COPY]', err);
        }
        if (typeof cb !== 'undefined') {
            cb();
        }
    });
}
