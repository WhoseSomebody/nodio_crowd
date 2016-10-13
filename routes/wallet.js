var express = require('express');
var router = express.Router();

/* GET wallet page. */
router.get('/', function(req, res, next) {
  res.render('wallet', { title: 'Wallet | Nodio Crowd' });
});

module.exports = router;
