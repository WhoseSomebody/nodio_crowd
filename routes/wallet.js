var express = require('express');
var router = express.Router();

/* GET wallet page. */
router.get('/', function(req, res, next) {
	if(req.session.userID)
  		res.render('wallet', { title: 'My Wallet | Nodio Crowd', userID: req.session.userID, userWallet: req.session.userWallet});
  	else 
  		res.redirect('/');
  	
});

module.exports = router;
