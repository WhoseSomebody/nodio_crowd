var express = require('express');
var router = express.Router();
var User = require('../models/user');
var FormatNumber = require('../helpers/format_number');
/* GET wallet page. */
router.get('/', function(req, res, next) {
	if(req.session.userID) {
		var user = User.find({wallet:req.session.userWallet});
    console.log(user);
		res.render('wallet', { title: 'My Wallet | Nodio Crowd', 
							userID: req.session.userID, 
							userWallet: req.session.userWallet,
							userInvestments: user.investments == 0 ? 0 : formatNumber(user.investments),
							userBalance: user.balance == 0 ? 0 : formatNumber(user.balance)});
  	}else{
  		res.redirect('/');
    }
  	
});

module.exports = router;


function formatNumber(number) {
  var s = [number-number%1, number%1];
  var str = s[1].toString().split('')
                .reverse().join("").match(/.{1,3}/g)
                .join(" ").split('').reverse() .join("") + 
                "." + (s[0]*10000-s[0]*10000%1 + s[0]).toString();
  return str;
}
var FormatNumber = formatNumber