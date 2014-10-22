var logger          = require('logfmt');
// var Promise         = require('promise');
// var uuid            = require('node-uuid');
// var EventEmitter    = require('events').EventEmitter;

// var connections     = require('./connector');
// var ArticleModel    = require('./article-model');

// var SCRAPE_QUEUE = 'jobs.scrape';
// var VOTE_QUEUE = 'jobs.vote';

function App(config) {
    // EventEmitter.call(this);

    // this.connections = connections(config.mongo_url, config.rabbit_url);
    // this.connections.once('ready', this.onConnected.bind(this));
    // this.connections.once('lost', this.onLost.bind(this));
}

module.exports = function createApp(config) {
    return new App(config);
};

App.prototype = Object.create(Object.prototype);

App.prototype.home = function(req, res, next) {};
App.prototype.page = function(req, res, next) {};
App.prototype.project = function(req, res, next) {};

// App.prototype.onConnected = function() {
//     var queues = 0;
//     // this.Article = ArticleModel(this.connections.db);
//     this.connections.queue.create(SCRAPE_QUEUE, { prefetch: 5 }, onCreate.bind(this));
//     // this.connections.queue.create(VOTE_QUEUE, { prefetch: 5 }, onCreate.bind(this));

//     function onCreate() {
//         if (++queues === 1) this.onReady();
//     }
// };

// App.prototype.onReady = function() {
//     logger.log({ type: 'info', msg: 'app.ready' });
//     this.emit('ready');
// };

// App.prototype.onLost = function() {
//     logger.log({ type: 'info', msg: 'app.lost' });
//     this.emit('lost');
// };

// // Called by the client. Starts the worker
// // Accepts a string buffer? Byte array? Form encoded object?
// App.prototype.doSomeWork = function(whatever) {
//     var id = uuid.v1();
//     this.connections.queue.publish(SCRAPE_QUEUE, {
//         id: id,
//         url: Math.random()+''
//     });
//     return Promise.resolve(id);
// };

// // Called by the client. Checks the status of the job
// // Accepts a job ID
// App.prototype.checkStatus = function(job_id) {
//     var id = uuid.v1();
//     this.connections.queue.publish(SCRAPE_QUEUE, {
//         id: id,
//         url: Math.random()+''
//     });
//     return Promise.resolve(id);
// };

// // App.prototype.addArticle = function(userId, url) {
// //     var id = uuid.v1();
// //     this.connections.queue.publish(SCRAPE_QUEUE, { id: id, url: url, userId: userId });
// //     return Promise.resolve(id);
// // };

// App.prototype.scrapeArticle = function(userId, id, url) {

//     // Return a setTimeout wrapped in a promise

//     // return this.Article.scrape(userId, id, url);
//     return new Promise(function(resolve, reject) {
//         var timer = setTimeout(onTime, 3000);
//         // this.connections.queue.purge(SCRAPE_QUEUE, onPurge);

//         function onTime() {
//             // if (err) return reject(err);
//             clearTimeout(timer);
//             resolve(true);
//         }
//     }.bind(this));
// };

// App.prototype.purgePendingArticles = function() {
//     logger.log({ type: 'info', msg: 'app.purgePendingArticles' });

//     return new Promise(function(resolve, reject) {
//         this.connections.queue.purge(SCRAPE_QUEUE, onPurge);

//         function onPurge(err, count) {
//             if (err) return reject(err);
//             resolve(count);
//         }
//     }.bind(this));
// };

// App.prototype.startScraping = function() {
//     this.connections.queue.handle(SCRAPE_QUEUE, this.handleScrapeJob.bind(this));
//     // this.connections.queue.handle(VOTE_QUEUE, this.handleVoteJob.bind(this));
//     return this;
// };

// App.prototype.handleScrapeJob = function(job, ack) {
//     if (!job.url) {
//         return ack();
//     }

//     logger.log({ type: 'info', msg: 'handling job', queue: SCRAPE_QUEUE, url: job.url });

//     this
//         .scrapeArticle(job.userId, job.id, job.url)
//         .then(onSuccess, onError);

//     function onSuccess() {
//         logger.log({ type: 'info', msg: 'job complete', status: 'success', url: job.url });
//         ack();
//     }

//     function onError() {
//         logger.log({ type: 'info', msg: 'job complete', status: 'failure', url: job.url });
//         ack();
//     }
// };

// App.prototype.stopScraping = function() {
//     this.connections.queue.ignore(SCRAPE_QUEUE);
//     // this.connections.queue.ignore(VOTE_QUEUE);
//     return this;
// };

// App.prototype.deleteAllArticles = function() {
//     logger.log({ type: 'info', msg: 'app.deleteAllArticles' });
//     // return this.Article.deleteAll();
// };
