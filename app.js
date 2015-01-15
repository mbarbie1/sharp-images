// Express and more practical default packages
var express = require('express');
var path = require('path');
var url = require('url');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var querystring = require('querystring');
// Require sharp
// var sharp = require('sharp');

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

	var imageViewer = require('./routes/imageViewer');
	app.use('/view', imageViewer);

	/* IIIF image server */
	app.get('/iiif-image/:identifier/:region/:size/:rotation/:quality.:format', function(req, res) {
/*		console
		var region, size, rotation, quality, format;

		var tifFormats = function tifFormats(format) {
			if (format == 'tif' || format == 'lsm' || format == 'flex')
			return 'tif';
		}
		var getRegion = function getRegion(region) {
			if (region == 'full') {
				return null;
			} else if {
				return Number(region.split());
			} else {
				return ;
			}
		}*/
		console.log(req.params);

		var p = req.params;
		var inputImage = p.identifier;

		//res.writeHead(200, {'Content-Type': 'image/png'});
		sharp(inputImage).png().pipe(res);
		
		//res.render('imageGET', { message: JSON.stringify(req.params) } );

		//region = p.region.split
		
		//if size == full
		//sharp(inputImage+tif).rotate(Number(p.rotation)).resize().webp().pipe(response);
				
		//{scheme}://{server}{/prefix}/{identifier}/{region}/{size}/{rotation}/{quality}.{format}
		//For example:
		//	http://www.example.org/image-service/abcd1234/full/full/0/default.jpg
	});

	app.use('/', function(req, res) {
		res.render('index', { title: 'Testing sharp images library' })
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
