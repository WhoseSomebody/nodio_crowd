var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.session.userID)
  		res.redirect('/account');
  	else{ 
		res.render('new_account', { title: 'Sign Up | Nodio Crowd', buttonTextB: "Copy Pass Phrase to Clipboard", buttonTextS: "COPY" });
  	}
  
});

module.exports = router;
