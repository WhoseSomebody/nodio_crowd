// CHANGE 'nol' here to change the number of address 
// in request to 'http://btc.blockr.io/api/v1/address/info/'
var nol = 20;

var mongoose = require("mongoose");
Agenda = require('agenda');
User = require('./models/user');
Total = require('./models/total');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var mongoConnectionString = "mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd";
var agenda = new Agenda({db: {address: mongoConnectionString}});
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd');


agenda.define('update all wallets', function(job, done) {
  console.log(Date.now());
  summaryInvested = 0,
  link = 'http://btc.blockr.io/api/v1/address/info/',
  xmlHttp = new XMLHttpRequest(),
  jsonResponses = [];
  

  User.find({}, function(err, users) {
    var userMap = {};
    var wallets = [];
    users.forEach(function(user) {
      userMap[user.wallet] = user.investments;
      wallets.push(user.wallet);
    });
    console.log(userMap);
    console.log(wallets);

    links = makeLinks(nol, wallets);

    console.log(links);

    for (var i=0; i<links.length; i++){
      xmlHttp.open("GET", links[i], false);
      xmlHttp.send(null);
      var response = JSON.parse(xmlHttp.responseText);
      var accounts = response.data;

      console.log(response);

      for (var j=1; j<accounts.length; j++){
        console.log(userMap[accounts[j].wallet] != accounts[j].totalreceived);
        if (userMap[accounts[j].address] != accounts[j].totalreceived)
        {
          updateUser(accounts[j].address, accounts[j].totalreceived);
        }
        summaryInvested += accounts[j].totalreceived != undefined ? accounts[j].totalreceived : 0;
        
        console.log(summaryInvested);
      }

    }

    updateTotal(summaryInvested);
    // createTotal(summaryInvested);


    function createTotal(new_score){
      var newScore = new Total({
        totalInvested : new_score,
        lastUpdate : Date.now()});
      newScore.save(function(err, newScore){
        if (err) return console.error(err);
      })
    }

    function updateTotal(new_score){
      Total.findOneAndUpdate({}, {
        totalInvested: new_score,
        lastUpdate: Date.now()
      }, 
        { sort: { 'lastUpdate' : -1 } }, 
        function(err, post) {
          console.log( post );
        });
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
  agenda.every('1 minute','update all wallets');
  // agenda.every('2 minutes', 'update all wallets');

  agenda.start();
})