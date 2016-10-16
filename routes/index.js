const express = require('express'),
    session = require('express-session'),
    router = express.Router(),
    User = require('../models/user'),
    fs = require('fs'),
    readline = require('readline'),
    stream = require('stream');
    
/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('index', { title: 'Nodio Crowd' });
});

router.post('/signup', (req, res, next) => {
    var input = __dirname + '/../public/crowdsale_list.txt',
        output = __dirname + '/../public/crowdsale_list_temp.txt',
        content = fs.readFileSync(input, 'utf8');

    content = content.split("\n");
    var id = content.splice(0,1);

    fs.writeFileSync(output, content.join("\n"));
    fs.renameSync(output,input);

    var user = new User({
        _id : id,
        password : req.body.key
    });

    var dbPromise = user.save();
    console.log(user);
    dbPromise.then(user => {
        req.session.userID = user._id;
        req.session.cookie.maxAge = 1000000;
        console.log(req.session);

        res.json({success: true, user: user});
    })
});

router.get('/logout', (req, res) => {
    req.session.userID = null;
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

      if (err) throw err;

      console.log("CHECK USER");
      console.log(user[0]);
      console.log(user.length);
      if (user.length > 0)  { 
        console.log(req.session);
        req.session.userID = user[0]._id;
        req.session.cookie.maxAge = 10000;
        console.log(req.session);
        res.json({success: true, user: user});
      } else {
        res.json({success: false});
        }
    });
});

module.exports = router;
