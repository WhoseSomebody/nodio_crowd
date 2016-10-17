var express = require('express');
var router = express.Router();
var helpers = require('utils');
var User = require('../models/user');
var FormatNumber = require('../helpers/format_number');
/* GET wallet page. */
router.get('/', function(req, res, next) {
	if(req.session.userID) {
    User.findOne({ 'wallet': req.session.userWallet }, '_id wallet balance investments', function (err, user) {
      if (err) return handleError(err);
      res.render('wallet', { title: 'My Wallet | Nodio Crowd', 
                    userID: user._id, 
                    userWallet: user.wallet,
                    userInvestments: user.investments != undefined ? helpers.format_numb(user.investments) : 0,
                    userBalance: user.balance != undefined ? helpers.format_numb(user.balance) : 0 
                    });

  	});}
    else{
  		res.redirect('/');
    }
  	
});

module.exports = router;



function updateUser(p_wallet, new_investments){
  User.update(
    {wallet: p_wallet}, 
    {investments: new_investments}, 
    function(err, affected, resp) 
    {
       console.log(resp);
    });
}