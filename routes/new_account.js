var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.session.userID)
  		res.redirect('/account');
  	else{ 
  		if (req.session.os == "X_X")
  			res.render('new_account', { title: 'Sign Up | Nodio Crowd', buttonTextB: "Go to the Next Step", buttonTextS: "NEXT" });
  		else if (req.session.os == "ok")
  			res.render('new_account', { title: 'Sign Up | Nodio Crowd', buttonTextB: "Copy Pass Phrase to Clipboard", buttonTextS: "COPY" });
  	}
  
});

module.exports = router;
