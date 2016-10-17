const express = require('express'),
    session = require('express-session'),
    router = express.Router(),
    User = require('../models/user'),
    Total = require('../models/total'),
    fs = require('fs'),
    readline = require('readline'),
    stream = require('stream'),
    platform = require('platform'),
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

/* GET home page. */
router.get('/', function(req, res, next) {
        if(req.session.userID)
            res.redirect('/account');
        else {
           totalInv = 0;
            Total.findOne({}, {}, { sort: { 'lastUpdate' : -1 } }, function(err, post) {
              if (post)
                totalInv = post;
            });
             console.log(platform.os.family);

            if (platform.os.family != undefined)
                if (platform.os.family.indexOf("iOS") >= 0 || platform.os.family.indexOf("Mac") >= 0)
                 {req.session.os = "X_X"} else {req.session.os = "ok"}
            console.log(req.session.os);
            res.render('index', {total: totalInv, title: 'Nodio Crowd' });
        }
});

router.post('/signup', (req, res, next) => {
    var input = __dirname + '/../public/crowdsale_list.txt',
        output = __dirname + '/../public/crowdsale_list_temp.txt',
        content = fs.readFileSync(input, 'utf8');

    content = content.split("\n");
    var wallet = content.splice(0,1);

    fs.writeFileSync(output, content.join("\n"));
    fs.renameSync(output,input);

    var user = new User({
        wallet : wallet,
        password : req.body.key
    });
    user.generateId(function(err, name) {
      if (err) throw err;

      console.log('Your new id is ' + name);
    });


    var dbPromise = user.save();
    console.log(user);
    dbPromise.then(user => {
        req.session.userID = user._id;
        req.session.userWallet = user.wallet;
        req.session.cookie.maxAge = 1000000;
        console.log(req.session);

        res.json({success: true});
    })
});

router.get('/logout', (req, res) => {
    req.session.userID = null;
    req.session.userWallet = null;
    req.session.cookie.maxAge = 0;
    console.log(session);
    // setTimeout(function() {res.redirect('/');}, 2000);
    if (req.session.userID == null && req.session.userWallet == null && req.session.cookie.maxAge == 0) {
        res.send({no_session:true})
    } else {
        res.send({no_session:false})
    }
});

router.get('/sesid', (req, res) => {
    if(req.session.userID)
        res.send(req.session.userID);
    else res.send('Session not set');
});

router.post('/login', function(req, res, next) {
    User.find({ password: req.body.key }, function(err, user) {
    console.log(req.body);
        
      if (err) throw err;


      console.log("CHECK USER");
      console.log(user);
      console.log(user.length);
      if (user.length > 0)  { 
        console.log(user[0]._id);
        req.session.userID = user[0]._id;
        req.session.userWallet = user[0].wallet;
        req.session.cookie.maxAge = 1000000;
        console.log(req.session);
        res.json({success: true});
      } else {
        res.json({success: false});
        }
    });
});


router.get('/refresh_wallets', function(req, res, next){
  User.find({}, function(err, users) 
  {
    if (err) throw err;
    var updUsers = users,
    summaryInvested = 0,
    link = 'http://btc.blockr.io/api/v1/address/info/',
    xmlHttp = new XMLHttpRequest(),
    jsonResponses = [];
    console.log("step1");
    updUsers.forEach(function(user, i) 
    {
      link += user.wallet != undefined ? user.wallet + "," : "";
      if (i % 30 == 0 || i == updUsers.length % 20) 
      {
        xmlHttp.open("GET", link.slice(0, -1), false);
        xmlHttp.send(null);
        var response = JSON.parse(xmlHttp.responseText);
        summaryInvested += response.totalreceived;
        console.log("step2");
        if (response.data != undefined)
        {
          if (response.data.length > 1)
          {
            response.data.forEach(function(wallet, j) 
            {
              console.log("step3");
              for (var t = 0; t < updUsers.length; t++) 
              {
                if (updUsers[t].wallet == wallet.address) 
                {
                  updUsers[t].balance = wallet.totalreceived;
                  User.update({wallet: updUsers[t].wallet}, 
                    {
                      investments: wallet.totalreceived,
                      balance: wallet.balance
                    },
                    function(err, affected, resp) 
                    {
                      summaryInvested += wallet.totalreceived;
                    });
                }
                link = 'http://btc.blockr.io/api/v1/address/info/';
                }
              })
            }  
          }
      }
    });
    if (Total.find({totalInvested: summaryInvested})) 
    {
      Total.findOneAndUpdate(
      {
        totalInvested: summaryInvested,
        lastUpdate: Date.now
      },function(err, affected, resp) 
        {
          // console.log(resp);
        });
    } else 
    {
      var newTotal = new Total(
      {
        totalInvested: summaryInvested,
        lastUpdate: Date.now
      });
      Total.create(newTotal,function(error) 
      {
        assert.ifError(error);
        var allTot = Total.find({});
        console.log(allTot);
      });
    }  
      res.json("Something is done.");
    })});

module.exports = router;
