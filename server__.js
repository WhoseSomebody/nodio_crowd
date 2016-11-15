// CHANGE 'nol' here to change the number of address 
// in request to 'http://btc.blockr.io/api/v1/address/info/'
var nol = 20;

var mongoose = require("mongoose");
Agenda = require('agenda');
User = require('./models/user');
Total = require('./models/total');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var ClientCoin = require('coinbase').Client;
var coin_client = new ClientCoin({'apiKey': '31wiI9hyhDoxlRI9',
                         'apiSecret': 'MLaXYt2NFcaqqTIr4KHpPgSUdAPWNtUL'});

var mongoConnectionString = "mongodb://heroku_nlwlq2hc:vg4e8l6uuv0lvnrgh5jvgeonjh@ds061826-a0.mlab.com:61826,ds061826-a1.mlab.com:61826/heroku_nlwlq2hc?replicaSet=rs-ds061826";
// var mongoConnectionString = "mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd";
var agenda = new Agenda({db: {address: mongoConnectionString}});
mongoose.Promise = global.Promise;
console.log("connecting to db ...");
mongoose.connect(mongoConnectionString);
console.log("connected.");


agenda.define('update all wallets', function(job, done) {
  // console.log(Date.now());
  summaryInvested = 32.3918,
  summaryInvestedETH = 0,
  link = 'http://btc.blockr.io/api/v1/address/info/',
  xmlHttp = new XMLHttpRequest(),
  jsonResponses = [];


    
  // console.log("Looking through USERs ...");
  User.find({}, function(err, users) {
    var userMap = {};
    var wallets = [];
    var walletsETH = [];
    coin_client.getAccount('84e00c4a-bc5f-5025-b395-459329b8e1d1', function(err, account) {
      updateTotalETH(account.balance.amount);
      summaryInvestedETH += account.balance.amount;

      coin_client.getExchangeRates({'currency': 'ETH'}, function(err, rates) {
        summaryInvested += summaryInvestedETH*rates.data.rates.BTC;
      });

      account.getAddresses(null, function(err, addresses) {
        addresses.forEach(function(address){
          updateUserETH(address.address, address.account.balance.amount);
        // console.log(address.address);
        // console.log(address.account.balance.amount);

        })
        // console.log(addresses[1]);
        // console.log(addresses);
      });
    });

    users.forEach(function(user) {
      // console.log("USER");
      // console.log(user);

      userMap[user.walletBTC] = user.investmentsBTC;
      wallets.push(user.walletBTC);
      walletsETH.push(user.walletETH);

    });
    users.forEach(function(user) {

      // web3.eth.getBalance.request(user.walletETH, function(err, value){
      //   console.log(err)
      //   console.log(value)
      //   updateUserETH(user.walletETH, value.toNumber());
         
      //  });
    });
    // console.log(userMap);
    // console.log(wallets);

    links = makeLinks(nol, wallets);

    // console.log(links);

    for (var i=0; i<links.length; i++){
      xmlHttp.open("GET", links[i].replace(/(\\r|\\)/g, ""), false);
      xmlHttp.send(null);
      var response = JSON.parse(xmlHttp.responseText);
      var accounts = response.data;

      // console.log(accounts);

      for (var j=0; j<accounts.length; j++){

        // console.log(accounts[j].address);
        if(accounts[j].address == "1NodaqpTFSxEfr5iN8niP25dxCv2kSWLoG")
        {
          // console.log(accounts[j].address);
          accounts[j].totalreceived += 2.4;
        }
        if (userMap[accounts[j].address] != accounts[j].totalreceived)
        {
          updateUserBTC(accounts[j].address, accounts[j].totalreceived);
        }
        
        summaryInvested += accounts[j] != undefined ? accounts[j].totalreceived : 0;
        
        // console.log(accounts[j] != undefined ? accounts[j] : "undefined");
        // console.log(summaryInvested);
      }

    }

    // updateTotal(summaryInvested);
    // createTotal(summaryInvested);
    Total.findOne( {}, function (err, result) {
        if (err) { 
          // console.log(err);
        }
        if (!result) {
          // console.log("Empty Total yet!");
          createTotal(summaryInvested);
        } else {
          updateTotalBTC(summaryInvested);
        }
    });

    function createTotal(new_score){
      var newScore = new Total({
        _id: "58077826aac9e83f99b01af9",
        totalInvested : new_score,
        lastUpdate : Date.now()});
      newScore.save(function(err, newScore){
        if (err) return console.error(err);
      })
    }

    function updateTotalBTC(new_score){
      var date = Date.now();
      var query = {"_id": "58077826aac9e83f99b01af9"};
      var update = {totalInvestedBTC: new_score, lastUpdate: date};
      var options = {returnNewDocument: true};
      Total.findOneAndUpdate(query, update, options, function(err, total) {
        if (err) {
          // console.log('got a BD "Total" error.');
        }
        // console.log('total');
      });
    }
    function updateTotalETH(new_score){
      var date = Date.now();
      var query = {"_id": "58077826aac9e83f99b01af9"};
      var update = {totalInvestedETH: new_score, lastUpdate: date};
      var options = {returnNewDocument: true};
      Total.findOneAndUpdate(query, update, options, function(err, total) {
        if (err) {
          // console.log('got a BD "Total" error.');
        }
        // console.log('total');
      });
    }


    function updateUserBTC(p_wallet, new_investments){
      User.findOneAndUpdate(
      {walletBTC: p_wallet}, 
      {investmentsBTC: new_investments}, 
        function(err, affected, resp) 
        {
          if (err) return console.error(err);
           // console.log("*********************************");
           // console.log(this);
        });
    }
    function updateUserETH(p_wallet, new_investments){
      User.findOneAndUpdate(
      {walletETH: p_wallet}, 
      {investmentsETH: new_investments}, 
        function(err, affected, resp) 
        {
          if (err) return console.error(err);
           // console.log("*********************************");
           // console.log(this);
          // console.log(affected)
          // console.log(new_investments)
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

  // console.log(Date.now());

  res.send("REFRESH IS MADE.");
  done();
});


agenda.on('ready', function() {
  // console.log("I am ready.")
  agenda.every('1 minute','update all wallets');
  // agenda.every('2 minutes', 'update all wallets');

  agenda.start();
})