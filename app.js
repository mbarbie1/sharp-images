// Express and more practical default packages
var express = require('express');
var path = require('path');
var url = require('url');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var querystring = require('querystring');

var app = express();

// view engine setup
app.set('port', process.env.PORT || 5000);
app.set('host', 'localhost');
app.set('Host', 'localhost:5000');
app.set('protocol', 'http');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
////////////////////////// We don't want any safety leak: allowing url encoding is one?
app.use(bodyParser.urlencoded({ extended: true }));

//var host = server.address().address;
var host = app.get('host');
var port = app.get('port');


/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////         ROUTES           /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////


	app.use('/', function(req, res) {
		res.render('index', { title: 'Hello, World!' })
	});


	
/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////     ERROR HANDLING      //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// error handlers

	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: 'Error.jade: ' + err.message,
			error: err
		});
	});

	module.exports = app;
