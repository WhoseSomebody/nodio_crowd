var express = require('express');
var router = express.Router();

/* GET wallet page. */
router.get('/', function(req, res, next) {
	if(req.session.userID)
  		res.render('wallet', {userID: req.session.userID});
  	else 
  		res.redirect('/');
  	
});

module.exports = router;
