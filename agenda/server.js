Agenda = require('agenda');
User = require('../models/user'),
var mongoConnectionString = "mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd";
var agenda = new Agenda({db: {address: mongoConnectionString}});


agenda.define('greet the world', function(job, done) {
  console.log(job.attrs.data.time, 'hello world!');
  done();
});

agenda.schedule('in 10 seconds', 'greet the world', {time: new Date()});
agenda.start();

console.log('Wait 10 seconds...');