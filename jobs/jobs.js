// var env       = process.env.NODE_ENV || 'development',
//     _         = require('lodash'),
//     config    = _.merge(require(__dirname + '/../config').global, require(__dirname + '/../config')[env]),
//     Agenda    = require('agenda'),
//     agenda    = new Agenda({db: {address: 'mongodb://localhost:27017/myApp', collection: 'tasks'}}),
//     jobTypes  = process.env.WORKERS ? process.env.WORKERS.split(',') : [],
//     db        = require(__dirname + '/mongo'), // Our internal MongoDB module to connect to our app's database
//     knex      = require('knex')(require(__dirname + '/../../knexfile')[env]),
//     bookshelf = require('bookshelf')(knex),
//     models    = require(__dirname + '/../models')(bookshelf);


// // Create MongoDB connection pool
// db.connect(config.mongodb('myApp'), function(err) {
//   if (err) {
//     logger.fatal(err);
//     process.exit(1);
//   }

//   // Start each job processor
//   jobTypes.forEach(function(type) {
//     require('./jobs/' + type)(agenda, db, models, config);
//   });
// });

// if (jobTypes.length) {
//   agenda.start();
// }

// // Handles graceful stopping of jobs
// function graceful() {
//   agenda.stop(function() {
//     db.close(function(e) {
//       if (e) logger.error(e);
//       process.exit(0);
//     });
//   });
// }

// process.on('SIGTERM', graceful);
// process.on('SIGINT' , graceful);

// module.exports = agenda;

var Agenda = require('agenda');
var mongoConnectionString = "mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd";
var agenda = new Agenda({db: {address: mongoConnectionString}});

agenda.define('update all wallets', function(job, done) {
  console.log("okay. I am done");
  done();
});

agenda.on('ready', function() {
  agends.every('5 seconds', 'update all wallets');

  arenda.start();
})

module.exports = agenda;


Agenda = require('agenda');

var mongoConnectionString = "mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd";
var agenda = new Agenda({db: {address: mongoConnectionString}});


agenda.define('greet the world', function(job, done) {
  console.log(job.attrs.data.time, 'hello world!');
  done();
});

agenda.schedule('in 10 seconds', 'greet the world', {time: new Date()});
agenda.start();

console.log('Wait 10 seconds...');