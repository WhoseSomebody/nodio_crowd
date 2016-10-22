const express = require('express'),
    session = require('express-session'),
    router = express.Router(),
    User = require('../models/user'),
    Total = require('../models/total'),
    fs = require('fs'),
    readline = require('readline'),
    stream = require('stream'),
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    helpers = require('utils'),
    password = require('password-hash-and-salt');

router.get('*',function(req,res,next){
  if(req.headers['x-forwarded-proto']!='https')
    // if (req.headers.host != "localhost:3000")
      res.redirect('https://'+req.headers.host+req.url)
  else
    next() /* Continue to other routes if we're not redirecting */
})
// router.get('*',function(req,res){  
//     res.redirect('https://'+req.headers.host+req.url)
//     console.log(req.url)
// })  
/* GET home page. */
router.get('/', function(req, res, next) {
  var ready = 0;
  if(req.session.userID)
      res.redirect('/account');
  else {
      totalInv = 0;
      Total.findOne({}, {}, { sort: { 'lastUpdate' : -1 } }, function(err, post) {
          totalInv = post == null ? 0 : post.totalInvested;
          ready = totalInv == 0 ?  0 : helpers.format_numb(totalInv)
          console.log(post);
          req.session.totalInvested = totalInv;
          res.render('index', {title: "Nodio ♢ Crowd",total: ready});
      });

      
  }
});

router.post('/signup', (req, res, next) => {
    var input = __dirname + '/../public/crowdsale_list.txt',
        output = __dirname + '/../public/crowdsale_list_temp.txt',
        content = fs.readFileSync(input, 'utf8'),
        user;
    content = content.split("\n");
    var wallet = content.splice(0,1);
    console.log(wallet);

    fs.writeFileSync(output, content.join("\n"));
    fs.renameSync(output,input);


    var hash = helpers.saltSHA512(req.body.key);

    user = new User({
      wallet : wallet,
      password : hash
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
    });
});

router.get('/logout', (req, res) => {
  
  req.session.userID = null;
  req.session.userWallet = null;
  req.session.cookie.maxAge = 0;
  console.log(res.session);
  resolve();

  // res.redirect('/');
  res.json({session: closed});

});

router.get('/sesid', (req, res) => {
    if(req.session.userID)
        res.send(req.session.userID);
    else res.send('Session not set');
});

router.post('/login', function(req, res) {
  var hash = helpers.saltSHA512(req.body.key);

  if (hash)
    User.findOne({password: hash}, function(err, user){

      if (user) {
        req.session.userID = user._id;
        req.session.userWallet = user.wallet;
        req.session.cookie.maxAge = 1000000;
      } 

      res.json({success: user != null});
    })
  else 
    res.json({success: false});

});


  // var promise = new Promise(function(resolve, reject) {
  //   User.find({}, function(err, users) {
  //     resolve(users);
  //   });
  // })

  // promise.then(function(userMap) {
  //   userMap.forEach(function(user){
  //     password(req.body.key).verifyAgainst(user.password, function(error, verified) {
  //       if(error){
  //           throw new Error('Something went wrong!');
  //           console.log(error);
  //         }
  //       if(!verified) {
  //           console.log("Missmatch!");           
  //       } else {
  //         found = true;
  //         req.session.userID = user._id;
  //         req.session.userWallet = user.wallet;
  //         req.session.cookie.maxAge = 1000000;
  //         console.log("OK!!!!")
  //         console.log(verified)
  //         res.json({success: true});
          
  //       };
  //     });
  //   });
  //   if (!found)
  //     res.json({success: false});
  // });


router.get('/refresh_wallets', function(req, res, next){
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

    links = makeLinks(50, wallets);

    console.log(links);

    for (var i=0; i<links.length; i++){
      xmlHttp.open("GET", links[i], false);
      xmlHttp.send(null);
      var response = JSON.parse(xmlHttp.responseText);
      var accounts = response.data;

      console.log(accounts);

      for (var j=1; j<accounts.length; j++){
        if (userMap[ac.wallet] != ac.investments)
        {
          updateUser(ac.wallet, ac.investments);
        }
        summaryInvested += ac.investments;

        console.log(summaryInvested);
      }

    }

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
    // updateTotal(summaryInvested);
    // createTotal(summaryInvested);


    function createTotal(new_score){
      var newScore = new Total({
        totalInvested : new_score,
        lastUpdate : Date.now});
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
      User.update(
        {wallet: p_wallet}, 
        {investments: new_investments}, 
        function(err, affected, resp) 
        {
           console.log(resp);
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
});


router.post("/create-total-score", function(req, res, next){
  var newScore = new Total({
    totalInvested : req.body.totalInvested,
    lastUpdate : Date.now});
  newScore.save(function(err, newScore){
    if (err) return console.error(err);
  })
})


module.exports = router;
