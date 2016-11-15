var express = require('express');
var router = express.Router();
var helpers = require('utils');
var User = require('../models/user');
var FormatNumber = require('../helpers/format_number');
/* GET wallet page. */
router.get('/', function(req, res, next) {
  setTimeout(function(){
  	if(req.session.userID) {
      User.findOne({ 'walletBTC': req.session.userWalletBTC }, '_id walletBTC walletETH investmentsETH investmentsBTC', function (err, user) {
        if (err) return handleError(err);
        var nods = 0, 
            percent = 0;
        if (user.investmentsBTC != undefined && req.session.totalInvestedBTC != undefined) {
          var numb = 1000000 * user.investmentsBTC / req.session.totalInvestedBTC;
          // SUM CONVERTED ETH TO BTC !!!
          nods = helpers.format_nods(numb);
          percent = parseFloat((numb * 1.0 / 10000).toFixed(10));
          console.log(nods + " " + percent);
        }
        console.log(nods);
        res.render('wallet', { title: 'My Wallet | Nodio Crowd', 
                      userID: user._id, 
                      userWalletBTC: user.walletBTC,
                      userInvestmentsBTC: (user.investmentsBTC == undefined || user.investmentsBTC == 0)? 0 : helpers.format_numb(user.investmentsBTC),
                      userWalletETH: user.walletETH,
                      userInvestmentsETH: (user.investmentsETH == undefined || user.investmentsETH == 0)? 0 : helpers.format_numb(user.investmentsETH),
                      userBalance: (user.balance == undefined || user.balance == 0) ? 0 : helpers.format_numb(user.balance),
                      userNods: nods,
                      userPercent: percent,
                      totalInvestedBTC: (req.session.totalInvestedBTC == undefined || req.session.totalInvestedBTC == 0) ? 0 : helpers.format_numb(req.session.totalInvestedBTC),
                      totalInvestedETH: (req.session.totalInvestedETH == undefined || req.session.totalInvestedETH == 0) ? 0 : helpers.format_numb(req.session.totalInvestedETH),
                      totalInvested: (req.session.totalInvested == undefined || req.session.totalInvested == 0) ? req.session.totalInvestedBTC : helpers.format_numb(req.session.totalInvested)
                      });

    	});
    }else{
  		res.redirect('/');
    }
  }, 1500)
  	
});

module.exports = router;



function updateUser(p_wallet, new_investmentsBTC, new_investmentsETH){
  User.update(
    {wallet: p_wallet}, 
    {investmentsBTC: new_investmentsBTC, investmentsETH: new_investmentsETH}, 
    function(err, affected, resp) 
    {
       console.log(resp);
    });
}