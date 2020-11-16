var fs              = require('fs');
var path            = require('path');
var fse             = require('fs-extra');
var klawSync        = require('klaw-sync');
var cheerio         = require('cheerio');
var sri             = require('node-sri');
var Promise         = require('promise');

const minimize          = require('minimize');
const uglifyJs          = require('uglify-es');
const concat            = require('concat');
const csso              = require('csso');
const imagemin          = require('imagemin');
const imageminPngquant  = require('imagemin-pngquant');
const imageminSvgo      = require('imagemin-svgo');

var dir = {
    current:                __dirname + '/',
    temp:                   __dirname + '/temp/',
    prod:                   __dirname + '/production/',
    pub:                    __dirname + '/public/',
    appview:                __dirname + '/app/views/',
    appcss:                 __dirname + '/app/views/css/',
    prodappview:            __dirname + '/production/app/views/',
    prodappviewpartials:    __dirname + '/production/app/views/partials/',
    prodappcss:             __dirname + '/production/app/views/css/',
    prodpub:                __dirname + '/production/public/',
    prodjs:                 __dirname + '/production/public/js/',
    prodcss:                __dirname + '/production/public/css/',
};

// -----------------------------------------------------------------------------

async function preprod() {
    console.log(':::: Preprod');

    await removeDir(dir.prodpub);
    await removeDir(dir.prodappview);
    await copyFiles(dir.pub,     dir.prodpub);
    await copyFiles(dir.appview, dir.prodappview);

    await merge({
        partialFile: 'styles',
        source: 'href="',
        concatinatedFile: 'concatinatedStyles.css',
        getTargetPath: hash => dir.prodcss + hash + '.css',
        writePartial: hash => {
            return 'link(rel="stylesheet", href="/public/css/' + hash + '.css")'
        },
        minify: fileContent => csso
                .minify(fileContent)
                .css,
    });

    await merge({
        partialFile: 'scripts',
        source: 'src="',
        concatinatedFile: 'concatinatedScripts.js',
        getTargetPath: hash => dir.prodjs + hash + '.js',
        writePartial: hash => {
            return 'script(crossorigin="anonymous", src="/public/js/' + hash + '.js")'
        },
        minify: fileContent => uglifyJs
                .minify(fileContent, { toplevel: true })
                .code,
    });

    await svgmin();
    await pngmin();

    // no longer needed as pug templates are already minified
    // await htmlmin();
}

preprod();

// -----------------------------------------------------------------------------

async function merge(cfg) {
    const partialPath = dir.prodappviewpartials + cfg.partialFile + '.pug';
    const partialFile = await fs.readFileSync(partialPath, 'utf8');
    const lines = partialFile.split('\n');

    let files = [];

    lines.forEach(line => {
        if (line.length === 0) {
            return;
        }

        const href = cfg.source;
        const hrefStart = line.indexOf(href);
        // cut out a substring from first char in the href path to the end
        const fileHref = line.substr(hrefStart + href.length);
        // split by " and get the first occurence to get everything up to the ending "
        let filePathRel = fileHref.split('"')[0];

        // remove / if there's one at the beginning of the path
        if (filePathRel[0] === '/') {
            filePathRel = filePathRel.substr(1);
        }

        const filePub = dir.current + filePathRel;
        const fileProd = dir.prod + filePathRel;
        files.push(fileProd);
        console.log('  load file:', filePub);
        let fileContent = fs.readFileSync(filePub, 'utf8');
        let minified = cfg.minify(fileContent);
        console.log('  write minified to:', fileProd);
        fs.writeFileSync(fileProd, minified);
    });

    let concated = await concat(files);
    // write to temp. sri needs a file
    let tempFile = '/tmp/' + cfg.concatinatedFile;
    console.log('  write concatinated file to:', tempFile);
    await fs.writeFileSync(tempFile, concated);
    // hash content
    let hash = await sri.hash(tempFile);
    let hashFilename = hash.replace(/\//ig, '_');
    console.log('  hash:', hash);
    console.log('  hash filename:', hashFilename);
    // copy file into production folder
    let target = cfg.getTargetPath(hashFilename);
    console.log('  copy:', tempFile, 'to:', target);
    await fs.createReadStream(tempFile).pipe(fs.createWriteStream(target));

    console.log('  write new content to partial:', partialPath);
    console.log('  new content:', cfg.writePartial(hashFilename));
    await fs.writeFileSync(partialPath,
                           cfg.writePartial(hashFilename));
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
