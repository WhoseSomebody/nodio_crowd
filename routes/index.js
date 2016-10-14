var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Nodio Crowd' });
});

router.post('/new_user', function(req, res) {
	console.log(req.body.name);
	res.send(req.name);
});

module.exports = router;
