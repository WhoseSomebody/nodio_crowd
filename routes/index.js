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




router.get('/', function(req, res, next) {
  var ready = 0;
  if(req.session.userID)
      res.redirect('/account');
  else {
      console.log(req.headers['user-agent']);
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
  User.find({}, (err, users) => {
    console.log(users);
      fs.writeFileSync(__dirname + '/list.txt', JSON.stringify(users));
      res.json({success: 'ok'});
  });
//     var input = __dirname + '/../public/crowdsale_list.txt',
//         output = __dirname + '/../public/crowdsale_list_temp.txt',
//         content = fs.readFileSync(input, 'utf8'),
//         user;
//     content = content.split("\n");
//     var wallet = content.splice(0,1);
//     console.log(wallet);

//     fs.writeFileSync(output, content.join("\n"));
//     fs.renameSync(output,input);

//     console.log(req.body.key + "BODY KEY !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
//     var hash = helpers.saltSHA512(req.body.key);

//     user = new User({
//       wallet : wallet,
//       password : hash
//     });

//     user.generateId(function(err, name) {
//       if (err) throw err;
//       console.log('Your new id is ' + name);
//     });


// user.save((err, user) => {
//   if (err) throw err;

//   req.session.userID = user._id;
//       req.session.userWallet = user.wallet;
//       req.session.cookie.maxAge = 1000000;
//       console.log(req.session + "Session !!!");

//       res.json({success: true});
// });

    // var dbPromise = user.save();
    // dbPromise.then(user => {
    //   req.session.userID = user._id;
    //   req.session.userWallet = user.wallet;
    //   req.session.cookie.maxAge = 1000000;
    //   console.log(req.session + "Session !!!");

    //   res.json({success: true});
    // })
    // dbPromise.catch(e => {
    //   console("ERROR !!!!!")
    //   console.log(e);
    // });
});




router.get('/logout', (req, res) => {
  
  req.session.userID = null;
  req.session.userWallet = null;
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



router.post("/create-total-score", function(req, res, next){
  var newScore = new Total({
    totalInvested : req.body.totalInvested,
    lastUpdate : Date.now});
  newScore.save(function(err, newScore){
    if (err) return console.error(err);
  })
})


module.exports = router;
