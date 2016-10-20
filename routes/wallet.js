var express = require('express');
var router = express.Router();
var helpers = require('utils');
var User = require('../models/user');
var FormatNumber = require('../helpers/format_number');
/* GET wallet page. */
router.get('/', function(req, res, next) {
  setTimeout(function(){
  	if(req.session.userID) {
      User.findOne({ 'wallet': req.session.userWallet }, '_id wallet balance investments', function (err, user) {
        if (err) return handleError(err);
        var nods = 0, 
            percent = 0;
        if (user.investments != undefined && req.session.totalInvested != undefined) {
          nods = helpers.format_nods(1000000 * user.investments / req.session.totalInvested);
          percent = helpers.format_nods(nods / 10000);
        }
        res.render('wallet', { title: 'My Wallet | Nodio Crowd', 
                      userID: user._id, 
                      userWallet: user.wallet,
                      userInvestments: (user.investments == undefined || user.investments == 0)? 0 : helpers.format_numb(user.investments),
                      userBalance: (user.balance == undefined || user.balance == 0) ? 0 : helpers.format_numb(user.balance),
                      userNods: nods,
                      userPercent: percent
                      });

    	});
    }else{
  		res.redirect('/');
    }
  }, 1500)
  	
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