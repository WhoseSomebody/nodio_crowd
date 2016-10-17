var express = require('express');
var stylus = require('express-stylus')
  , nib = require('nib')
  , svgFallback = require('express-svg-fallback')
  , koutoSwiss = require( "kouto-swiss" );
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var routes = require('./routes/index');
// var users = require('./routes/users');
var wallet = require('./routes/wallet');
var new_account = require('./routes/new_account');
var welcome = require('./routes/welcome'),
    session = require('express-session');

var app = express();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd')
// view engine setup
app.use(svgFallback({
  fallbackPath: __dirname + '/public'
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(stylus({
  src: __dirname + '/public',
  use: [koutoSwiss(), nib()],

}));
console.log(nib);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/account', wallet);
// app.use('/users', users);
app.use('/new_account', new_account);
app.use('/welcome', welcome);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
