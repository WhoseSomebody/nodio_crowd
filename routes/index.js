const express = require('express'),
    session = require('express-session'),
    router = express.Router(),
    User = require('../models/user'),
    Total = require('../models/total'),
    fs = require('fs'),
    readline = require('readline'),
    stream = require('stream'),
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    helpers = require('utils');

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
          res.render('index', {title: "Nodio ♢ Crowd",total: ready});
      });

      
  }
});

router.post('/signup', (req, res, next) => {
    var input = __dirname + '/../public/crowdsale_list.txt',
        output = __dirname + '/../public/crowdsale_list_temp.txt',
        content = fs.readFileSync(input, 'utf8');

    content = content.split("\n");
    var wallet = content.splice(0,1);
    console.log(wallet);

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
        // console.log(user[0]._id);
        req.session.userID = user[0]._id;
        req.session.userWallet = user[0].wallet;
        req.session.cookie.maxAge = 1000000;
        // console.log(req.session);
        res.json({success: true});
      } else {
        res.json({success: false});
        }
    });
});


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
  // User.find({}, function(err, users) 
  // {
  //   if (err) throw err;
  //   updUsers = users,

    // for (var i=0; i < updUsers.length; i++)
    // {

    //   link += updUsers[i].wallet != undefined ? (updUsers[i].wallet + ",") : "";
    //   if (i % 50 === 0 || i === updUsers.length % 50) 
    //   {
    //     console.log(link);
    //     xmlHttp.open("GET", link, false);
    //     xmlHttp.send(null);
    //     var response = JSON.parse(xmlHttp.responseText);

    //     console.log(response);
    //     if (response.data != undefined)
    //     {
    //       // if (response.data.length > 1)
    //       // {
    //         // console.log("response.data");
    //         // console.log(response.data);
    //         // response.data.forEach(function(wallet, j) 
    //         var wallet = response.data;
    //         for (var j = 0; j < response.data.length; j++ )
    //         {
    //           for (var t = 0; t < updUsers.length; t++) 
    //           {
    //             if (updUsers[t].wallet == wallet[j].address) 
    //             {
    //               summaryInvested += wallet[j].totalreceived;
    //               // updUsers[t].balance = wallet[j].balance;
    //               users[i].estments = wallet[j].totalreceived,
    //               users[i].balance = wallet[j].balance

    //               console.log(summaryInvested);
    //               console.log("======= " + i + " =======");
    //               link = 'http://btc.blockr.io/api/v1/address/info/';
    //             }
    //           }
    //         }  
    //       }
    //   }
    // }
    // console.log("?????");
    // if (Total.findOneAndUpdate({totalInvested: summaryInvested})) 
    // {
    //   Total.findOneAndUpdate(
    //     {totalInvested: summaryInvested},
    //   {
    //     totalInvested: summaryInvested,
    //     lastUpdate: Date.now
    //   },function(err, affected, resp) 
    //     {
    //       // console.log(resp);
    //     });
    // } else 
    // {
    //   var newTotal = new Total(
    //   {
    //     totalInvested: summaryInvested,
    //     lastUpdate: Date.now
    //   });
    //   newTotal.save(function(error) 
    //   {
    //     assert.ifError(error);

    //   });
    // }  
      

module.exports = router;
