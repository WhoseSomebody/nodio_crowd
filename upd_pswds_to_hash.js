var mongoose = require("mongoose");
Agenda = require('agenda');
User = require('./models/user');
Total = require('./models/total');
var password = require('password-hash-and-salt');

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var mongoConnectionString = "mongodb://heroku_nlwlq2hc:vg4e8l6uuv0lvnrgh5jvgeonjh@ds061826-a0.mlab.com:61826,ds061826-a1.mlab.com:61826/heroku_nlwlq2hc?replicaSet=rs-ds061826";
// var mongoConnectionString = "mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd";
var agenda = new Agenda({db: {address: mongoConnectionString}});
mongoose.Promise = global.Promise;
console.log("connecting to db ...");
mongoose.connect(mongoConnectionString);
console.log("connected.");


agenda.define('update all wallets', function(job, done) {

	User.find({}, function(err, users) {
    var userMap = {};
    users.forEach(function(user) {
      console.log("USER");
      console.log(user);

      userMap[user._id] = user.password;
    
      password(user.password).hash(function(error, hash) {
        if(error){
          throw new Error('Something went wrong!');
          console.log(error);
        }
        updateUser(user._id, hash);
              
      });
  
      function updateUser(p_id, new_hash){
        User.findOneAndUpdate(
        {_id: p_id}, 
        {password: new_hash}, 
          function(err, affected, resp) 
          {
            if (err) return console.error(err);
             console.log("*********************************");
             console.log(affected);
          });
      }
    });
    console.log("DONE!")
  });
  
  done();
});


agenda.on('ready', function() {
  console.log("I am ready.")
  // agenda.now('update all wallets');
  agenda.every('5 minutes', 'update all wallets');

  agenda.start();
}) 
