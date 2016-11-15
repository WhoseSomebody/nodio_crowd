const express = require('express'),
    session = require('express-session'),
    router = express.Router(),
    Wallets = require('./models/wallets'),
    fs = require('fs'),
    readline = require('readline'),
    stream = require('stream'),
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    helpers = require('utils'),
    password = require('password-hash-and-salt');
var wallet,
    wallets,
    id;
var ClientCoin = require('coinbase').Client;
var coin_client = new ClientCoin({'apiKey': '31wiI9hyhDoxlRI9',
                         'apiSecret': 'MLaXYt2NFcaqqTIr4KHpPgSUdAPWNtUL'});


var mongoose = require("mongoose");
User = require('./models/user');
Total = require('./models/total');

var mongoConnectionString = "mongodb://heroku_nlwlq2hc:vg4e8l6uuv0lvnrgh5jvgeonjh@ds061826-a0.mlab.com:61826,ds061826-a1.mlab.com:61826/heroku_nlwlq2hc?replicaSet=rs-ds061826";
// var mongoConnectionString = "mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd";

mongoose.Promise = global.Promise;
console.log("connecting to db ...");
mongoose.connect(mongoConnectionString);
console.log("connected.");

coin_client.getAccount('84e00c4a-bc5f-5025-b395-459329b8e1d1', function(err, account) {
      if (err) console.log(err)
User.find({}, function(err, users) {
    console.log(users);
    users.forEach(function(doc) {
    var _wallet = doc.wallet,
        _investments = doc.investments;

    
      // console.log(doc);
      account.createAddress(null, function(err, addressETH) {
        if (err) console.log(err)
        setTimeout(function(){
          User.update({_id:doc._id, walletETH: null}, 
        { $set : 
          { 
            "walletBTC": _wallet,
            "walletETH": addressETH.address,
            "investmentsBTC": _investments,
            "investmentsETH": 0
          }
        }, function(error, usr) {
          console.log(error);
          // console.log(usr)
        });
        }, 10)
        
        
      });
    });
  });
});