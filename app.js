var bodyParser = require('body-parser');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('static-favicon');
var http = require('http');
var logger = require('morgan');
var monday_sdk = require('monday-sdk-js');
var mongo = require('mongodb');
var monk = require('monk');
var methodOverride = require('method-override');
var path = require('path');
var q = require('q');
var session = require('express-session');
var swig = require('swig');

/***********************************
DEFINE MODELS
***********************************/
var monday_db = require('./models/monday_db.js');

var app = express();

/***********************************
DEFINE DB CONNECTIONS AND CLIENT LIBRARY CONNECTIONS
***********************************/
var db = monk('username:password@127.0.0.1:27017/monday_db?authSource=admin');

// view engine setup
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', false);
swig.setDefaults({cache:false});

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: 'secret_code', saveUninitialized: true, resave: true, cookie: { maxAge: 3600000 }}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use(function(req, res, next){
  req.db = db;
  req.monday_db = monday_db;
  next();
});

/***********************************
DEFINE ROUTES
***********************************/
var monday = require('./routes/monday.js');

/*************************
ENDPOINTS
*************************/

/* MONDAY.COM END POINTS */
app.get('/monday/check_tmod', monday.check_tmod);
app.post('/monday/save_tmod', monday.save_tmod);
app.get('/monday', monday.monday);

/*************************
catch 404 and forwarding to error handler
*************************/
app.use(function(req, res, next) {var err = new Error('Not Found'); err.status = 404; next(err);});

/*************************
development error handler; will print stacktrace
*************************/
if (app.get('env') === 'development') {app.use(function(err, req, res, next) {res.render('error', {message: err.message, error: err});});}

/*************************
production error handler; no stacktraces leaked to user
*************************/
app.use(function(err, req, res, next) {res.render('error', {message: err.message, error: {}});});

module.exports = app;
