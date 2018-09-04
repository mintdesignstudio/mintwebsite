var fs              = require('fs');
var path            = require('path');
var fse             = require('fs-extra');
var klawSync        = require('klaw-sync');
var cheerio         = require('cheerio');
var sri             = require('node-sri');
var Promise         = require('promise');

const minimize          = require('minimize');
const uglifyJs          = require('uglify-js');
const concat            = require('concat');
const crass             = require('crass');
const imagemin          = require('imagemin');
const imageminPngquant  = require('imagemin-pngquant');
const imageminSvgo      = require('imagemin-svgo');

var dir = {
    temp:           __dirname + '/temp/',
    prod:           __dirname + '/production/',
    pub:            __dirname + '/public/',
    appview:        __dirname + '/app/views/',
    appcss:         __dirname + '/app/views/css/',
    prodappview:    __dirname + '/production/app/views/',
    prodappcss:     __dirname + '/production/app/views/css/',
    prodpub:        __dirname + '/production/public/',
    prodjs:         __dirname + '/production/public/js/',
    prodcss:        __dirname + '/production/public/css/',
};

// -----------------------------------------------------------------------------

async function preprod() {
    console.log(':::: Preprod');

    await removeDir(dir.prodpub);
    await removeDir(dir.prodappview);
    await copyFiles(dir.pub,     dir.prodpub);
    await copyFiles(dir.appview, dir.prodappview);

    await merge({
        query:            'link[data-merge="yes"]',
        linkAttr:         'href',
        concatinatedFile: 'concatedStyles.css',
        target: hash => dir.prodcss + hash + '.css',
        htmlElm: hash => '<link '+
            'rel="stylesheet" '+
            'type="text/css" '+
            'integrity="' + hash + '" '+
            'href="/public/css/'+hash+'.css">',
        minify: fileContent => crass
                .parse(fileContent)
                .optimize()
                .toString(),
    });

    await merge({
        query:            'script[data-merge="yes"]',
        linkAttr:         'src',
        concatinatedFile: 'concatedScripts.js',
        target: hash => dir.prodjs + hash + '.js',
        htmlElm: hash => '<script '+
            'type="text/javascript" '+
            'integrity="' + hash + '" '+
            'src="/public/js/'+hash+'.js" '+
            'crossorigin="anonymous"></script>',
        minify: fileContent => uglifyJs
                .minify(fileContent, { toplevel: true })
                .code,
    });

    await svgmin();
    await pngmin();

    await htmlmin();
}

preprod();

// -----------------------------------------------------------------------------

async function merge(cfg) {
    console.log('Merge');
    let mainHbs = dir.prodappview + 'layouts/main.hbs';
    console.log('  Read main template:', mainHbs);
    let mainTemplate = await fs.readFileSync(mainHbs, 'utf8');
    let files = [];
    let $ = cheerio.load(mainTemplate);
    let mergeables = $(cfg.query);

    mergeables.each((i, elm) => {
        let filePathRel = $(elm).attr(cfg.linkAttr);
        let filePathPub = __dirname + filePathRel;
        let filePathProd = __dirname + '/production' + filePathRel;
        files.push(filePathProd);
        console.log('  load file:', filePathPub);
        let fileContent = fs.readFileSync(filePathPub, 'utf8');
        let minified = cfg.minify(fileContent);
        fs.writeFileSync(filePathProd, minified);
    });

    let concated = await concat(files);
    // write to temp. sri needs a file
    let tempFile = dir.temp + cfg.concatinatedFile;
    console.log('  write temp file:', tempFile);
    await fs.writeFileSync(tempFile, concated);
    // hash content
    let hash = await sri.hash(tempFile);
    hash = hash.replace(/\//ig, '_');
    console.log('  hash:', hash);
    // copy file into production folder
    let target = cfg.target(hash);
    console.log('  copy:', tempFile, 'to:', target);
    await fs.createReadStream(tempFile).pipe(fs.createWriteStream(target));

    mergeables.each((i, elm) => {
        if (i < mergeables.length - 1) {
            $(elm).remove();
        } else {
            $(elm).replaceWith(cfg.htmlElm(hash));
        }
    });

    console.log('Write main template:', mainHbs);
    await fs.writeFileSync(mainHbs, $.html());
    return files;
}

async function htmlmin() {
    console.log('HTMLMin');

    let min = new minimize({
        empty: true,        // KEEP empty attributes
        cdata: true,        // KEEP CDATA from scripts
        comments: false,    // KEEP comments
        ssi: false,         // KEEP Server Side Includes
        conditionals: true, // KEEP conditional internet explorer comments
        spare: true,        // KEEP redundant attributes
        quotes: true,       // KEEP arbitrary quotes
        loose: false        // KEEP one whitespace
    });

    listFiles(dir.prodappview, '.hbs')
        .map(file => file.path)
        .forEach(file => {
            let content = fs.readFileSync(file, 'utf8');
            min.parse(content, (error, data) => {
                fs.writeFileSync(file, data);
            });
        });
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

function listFiles(dir, ext) {
    return klawSync(dir, {nodir: true}).filter(function(file) {
        let fileExt = path.extname(file.path);
        return fileExt !== '' && (ext === '*.*' || fileExt === ext);
    });
}

async function removeDir(dir) {
    try {
        await fse.removeSync(dir);
        console.log('Removed dir', dir);
    } catch (err) {
        console.error(err);
    }
}

async function copyFiles(from_dir, to_dir) {
    try {
        await fse.copySync(from_dir, to_dir);
        console.log('Copied', from_dir, 'to', to_dir);
    } catch (err) {
        console.error(err);
    }
}
