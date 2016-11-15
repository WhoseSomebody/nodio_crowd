const express = require('express'),
    session = require('express-session'),
    router = express.Router(),
    User = require('../models/user'),
    Total = require('../models/total'),
    Wallets = require('../models/wallets'),
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

Wallets.findOne({}, 
  function(err, doc) {
    if(err) console.log(err);
    wallets = doc.numbers;
    id = doc._id;
  }
);

router.get('*',function(req,res,next){
  if(req.headers['x-forwarded-proto']!='https')
    // if (req.headers.host != "localhost:3000")
      res.redirect('https://'+req.headers.host+req.url)
  else
    next() /* Continue to other routes if we're not redirecting */
})

router.post('/signup', (req, res, next) => {
  coin_client.getAccount('84e00c4a-bc5f-5025-b395-459329b8e1d1', function(err, account) {
    account.createAddress(null, function(err, addressETH) {
      console.log(addressETH.address);
      wallet = wallets.splice(0,1)[0];

      Wallets.findOne({}, 
        function(err, doc) {
          doc.numbers.remove(wallet);
          doc.save();
      });
      var hash = helpers.saltSHA512(req.body.key);

      user = new User({
        walletBTC : wallet,
        walletETH : addressETH.address,
        password : hash
      });

      user.generateId(function(err, name) {
        if (err) throw err;
        console.log('Your new id is ' + name);
      });


      user.save((err, user) => {
        if (err) throw err;

        req.session.userID = user._id;
        req.session.userWalletBTC = user.walletBTC;
        req.session.userWalletETH = user.walletETH;
        req.session.cookie.maxAge = 1000000;
        res.json({success: true});
      });
    });
  });     
});

router.get('/update_schema_user', function(req, res, next) {
  coin_client.getAccount('84e00c4a-bc5f-5025-b395-459329b8e1d1', function(err, account) {
    console.log(account);
    User.find({}, function(err, users) {
      users.forEach(function(doc) {
        var _wallet = doc.wallet,
            _investments = doc.investments;

        account.createAddress(null, function(err, addressETH) {
          User.update({_id:doc._id}, 
          { $set : 
            { 
              "walletBTC": _wallet,
              "walletETH": addressETH.address,
              "investmentsBTC": _investments,
              "investmentsETH": 0
            }
          }, function(error, usr) {
            console.log(error);
            console.log(usr)
          });

        });
      });
    });
  });
  res.text("USERS are updated!")

});

router.get('/user_remove_old_fields', function(req, res, next) {
  User.dropIndex('investments_1');
  User.dropIndex('wallet_1');
  res.text("REMOVED")
})

router.get('/', function(req, res, next) {
  var readyBTC = "", readyETH = "", ready = "";
  if(req.session.userID)
      res.redirect('/account');
  else {
      console.log(req.headers['user-agent']);
      var totalInvBTC = 0.0,
          totalInvETH = 0.0;
          totalInv = 0.0;
      Total.findOne({}, {}, { sort: { 'lastUpdate' : -1 } }, function(err, post) {
        totalInvBTC = post == null ? 0 : post.totalInvestedBTC;
        readyBTC = totalInvBTC == 0 ?  0 : helpers.format_numb(totalInvBTC)
        req.session.totalInvestedBTC = totalInvBTC;

        totalInvETH = post == null ? 0 : post.totalInvestedETH;
        readyETH = totalInvETH == 0 ?  0 : helpers.format_numb(totalInvETH)
        req.session.totalInvestedETH = totalInvETH;


        coin_client.getExchangeRates({'currency': 'ETH'}, function(err, rates) {
          console.log(err)
          totalInv = parseFloat(totalInvETH*parseFloat(rates.data.rates.BTC) + totalInvBTC);
          ready = helpers.format_numb(totalInv)
          req.session.totalInvested = totalInv;

          console.log(totalInv);
          res.render('index', {title: "Nodio ♢ crowdsale_listd", totalBTC: readyBTC, totalETH: readyETH, total: ready});
        });


        
      });
  }
});


router.get('/logout', (req, res) => {
  
  req.session.userID = null;
  req.session.userWalletBTC = null;
  req.session.userWalletETH = null;
  req.session.cookie.maxAge = 0;

  // res.redirect('/');
  // setTimeout(function() {
    res.json({session: "closed"});
  // }, 500);

});




router.get('/sesid', (req, res) => {
    if(req.session.userID)
        res.send(req.session.userID);
    else res.send('Session not set');
});

router.get('/wallets-write-to-db', (req, res) => {
  var input = __dirname + '/../public/crowdsale_list.txt'
      content = fs.readFileSync(input, 'utf8');
  content = content.split("\n");

  var newWallets = new Wallets({
    numbers: content
  });

  newWallets.save(function(err, newScore){
    if (err) return console.error(err);
    console.log("WRITTEN");
  });

  res.text("Written");
  // for (var c = 0; c < content.length; c++) {
  //   var wallet = content.splice(0,1);
  
  //   Wallets.findOneAndUpdate({},{$push: {'numbers': wallet}}, {upsert: ture}, function(err, wal){
  //     if (err)
  //       console.log(err);
  //     console.log("WRITTEN");
  //   })
  // }
});



router.post('/login', function(req, res) {
  var hash = helpers.saltSHA512(req.body.key);

  if (hash)
    User.findOne({password: hash}, function(err, user){

      if (user) {
        req.session.userID = user._id;
        req.session.userWalletBTC = user.walletBTC;
        req.session.userWalletETH = user.walletETH;
        req.session.cookie.maxAge = 1000000;
      } 

      res.json({success: user != null});
    })
  else 
    res.json({success: false});

});



router.post("/create-total-score", function(req, res, next){
  var newScore = new Total({
    totalInvestedBTC : req.body.totalInvestedBTC,
    totalInvestedETH : req.body.totalInvestedETH,
    lastUpdate : Date.now});
  newScore.save(function(err, newScore){
    if (err) return console.error(err);
  })
})


module.exports = router;
