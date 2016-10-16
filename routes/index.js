const express = require('express'),
    session = require('express-session'),
    router = express.Router(),
    User = require('../models/user'),
    fs = require('fs'),
    readline = require('readline'),
    stream = require('stream');
    
/* GET home page. */
router.get('/', function(req, res, next) {
        if(req.session.userID)
            res.redirect('/account');
        else 
            res.render('index', { title: 'Nodio Crowd' });
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
    res.redirect('/');
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

module.exports = router;
