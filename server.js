// CHANGE 'nol' here to change the number of address 
// in request to 'http://btc.blockr.io/api/v1/address/info/'
var nol = 20;

var mongoose = require("mongoose");
Agenda = require('agenda');
User = require('./models/user');
Total = require('./models/total');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// var mongoConnectionString = "mongodb://heroku_m49x5k54:jrtegd6gljlcmpr6u8jj1ql2ia@ds061206.mlab.com:61206/heroku_m49x5k54";
var mongoConnectionString = "mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd";
var agenda = new Agenda({db: {address: mongoConnectionString}});
mongoose.Promise = global.Promise;
console.log("connecting to db ...");
mongoose.connect('mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd');
console.log("connected.");


agenda.define('update all wallets', function(job, done) {
  console.log(Date.now());
  summaryInvested = 0,
  link = 'http://btc.blockr.io/api/v1/address/info/',
  xmlHttp = new XMLHttpRequest(),
  jsonResponses = [];
  
  console.log("иуащку USER");
  User.find({}, function(err, users) {
    var userMap = {};
    var wallets = [];
    users.forEach(function(user) {
      console.log("USER");
      console.log(user);

      userMap[user.wallet] = user.investments;
      wallets.push(user.wallet);
    });
    console.log(userMap);
    console.log(wallets);

    links = makeLinks(nol, wallets);

    console.log(links);

    for (var i=0; i<links.length; i++){
      xmlHttp.open("GET", links[i].replace(/(\\r|\\)/g, ""), false);
      xmlHttp.send(null);
      var response = JSON.parse(xmlHttp.responseText);
      var accounts = response.data;

      console.log(response.data);

      for (var j=0; j<accounts.length; j++){
        if (userMap[accounts[j].address] != accounts[j].totalreceived)
        {
          updateUser(accounts[j].address, accounts[j].totalreceived);
        }
        
        summaryInvested += accounts[j] != undefined ? accounts[j].totalreceived : 0;
        
        // console.log(accounts[j] != undefined ? accounts[j] : "undefined");
        console.log(summaryInvested);
      }

    }

    // updateTotal(summaryInvested);
    // createTotal(summaryInvested);
    Total.findOne( {}, function (err, result) {
        if (err) { 
          console.log(err);
        }
        if (!result) {
          console.log("Empty Total yet!");
          createTotal(summaryInvested);
        } else {
          updateTotal(summaryInvested);
        }
    });

    function createTotal(new_score){
      var newScore = new Total({
        totalInvested : new_score,
        lastUpdate : Date.now()});
      newScore.save(function(err, newScore){
        if (err) return console.error(err);
      })
    }

    function updateTotal(new_score){
      var date = Date.now();
      // Total.findOneAndUpdate({}, {
      //   totalInvested: new_score,
      //   lastUpdate: Date.now()
      // }, 
      //   { sort: { 'lastUpdate' : -1 } }, 
      //   function(err, post) {
      //     console.log( post );
      //   });
      try {
      //   Total.findOneAndUpdate({ },
      //    { $set: { "totalInvested" : new_score, "lastUpdate" :  Date.now()}},
      //    { sort: { "lastUpdate" : -1 }, upsert:true, returnNewDocument : true });
      // }
        var ch = Total.findOneAndUpdate(
          {},
          {totalInvested: new_score, lastUpdate: date},
          {sort : { "lastUpdate" : -1 },
          returnNewDocument : true })
        
        console.log(ch);
      }
        catch (e){
           console.log(e);
        }
    }


    function updateUser(p_wallet, new_investments){
      User.findOneAndUpdate(
      {wallet: p_wallet}, 
      {investments: new_investments}, 
        function(err, affected, resp) 
        {
          if (err) return console.error(err);
           console.log("*********************************");
           console.log(this);
        });
    }


    function makeLinks(chunk, arr){
      var i,j,temparray,links = [];

      for (i=0,j=arr.length; i<j; i+=chunk) {
          temparray = arr.slice(i,i+chunk);
          links.push(link + temparray.join(","));
      }
      return links;
    }

  });

  console.log(Date.now());

  res.send("REFRESH IS MADE.");
  done();
});


agenda.on('ready', function() {
  console.log("I am ready.")
  agenda.every('1 minute','update all wallets');
  // agenda.every('2 minutes', 'update all wallets');

  agenda.start();
})