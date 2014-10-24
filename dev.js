var nodemon = require('nodemon');

nodemon({
    script: 'main.js',
    // env: {
    //     'MONGOLAB_URI': 'mongodb://mimura:finance@localhost:27017/mimura',
    //     'PORT':         3000,
    //     'NODE_ENV':     'development'
    // },
    ext: 'js json',
    watch: [
        'app/**/*.*',
        'config.js',
        'main.js',
        'package.json'
    ],
});

nodemon.on('start', function () {
    console.log('Server has started');
}).on('quit', function () {
    console.log('Server has quit');
}).on('restart', function (files) {
    console.log('Server restarted due to: ', files);
});
