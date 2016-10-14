var express = require('express');
var router = express.Router();
var User = require('../models/user')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Nodio Crowd' });
});

router.post('/new_user', (req, res) => {
    var user = new User({
        id : '',
		password : req.body.key
    });

    user.generateId(req.body.key);

    console.log("NEW USER");

    user.save((err) => {
        if (err) throw err;

        res.json({success: true})
    });


});

router.post('/check_user', (req, res) => {
	User.find({ password: req.body.key }, function(err, user) {

	  if (err) throw err;

      console.log("CHECK USER");

      if (user.length > 0)       
        res.json({success: true, user: user});
      else
        res.json({success: false});
	});
})
module.exports = router;
