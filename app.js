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
var sharp = require('sharp');

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


	app.use(express.static(path.join(__dirname,'/public')));
	app.use('/public',express.static(path.join(__dirname,'/public')));
	app.use('/scripts',express.static(path.join(__dirname,'/public/scripts')));
	app.use('/styles',express.static(path.join(__dirname,'/public/styles')));
	app.use('/view',express.static(path.join(__dirname,'/public/scripts')));

	var imageViewer = require('./routes/imageViewer')
	app.use('/view', imageViewer);


	function getRegion(region, w, h) {
		var regionStruct = {};
		if (region == 'full') {
			regionStruct.x = 0;
			regionStruct.y = 0;
			regionStruct.w = w;
			regionStruct.h = h;
			return regionStruct;
		} else if (region.match(/pct/) != null) {
			console.log('Percentage values');
			region = region.replace(/pct:/,'');
			region = region.split(',');
			regionStruct.x = Math.round( Number(region[0] * w) );
			regionStruct.y = Math.round( Number(region[1] * h) );
			regionStruct.w = Math.round( Number(region[2] * w) );
			regionStruct.h = Math.round( Number(region[3] * h) );
			return regionStruct;
		} else {
			console.log('Absolute values');
			region = region.split(',');
			console.log(region[0]);
			console.log(region[1]);
			console.log(region[2]);
			console.log(region[3]);
			regionStruct.x = Number(region[0]);
			regionStruct.y = Number(region[1]);
			regionStruct.w = Number(region[2]);
			regionStruct.h = Number(region[3]);
			return regionStruct;
		}
	}

	function getSize(size, w, h) {
		var sizeStruct = {};
		if (size == 'full') {
			return null;
		} else if (size.match(/pct/) != null) {
			console.log('Size: Percentage values');
			size = size.replace(/pct:/,'');
			size = region.split(',');
			sizeStruct.w = (size[0] == '') ? null: Math.round( Number(size[0] * w) );
			sizeStruct.h = (size[1] == '') ? null: Math.round( Number(size[1] * h) );
			return sizeStruct;
		} else {
			console.log('Size: Absolute values');
			size = size.split(',');
			console.log(size);
			sizeStruct.w = (size[0] == '') ? null: Number(size[0]);
			sizeStruct.h = (size[1] == '') ? null: Number(size[1]);
			return sizeStruct;
		}
	}

	/* IIIF image server */
	app.get('/iiif-image/:identifier/:region/:size/:rotation/:quality.:format', function(req, res) {
/*		console
		var region, size, rotation, quality, format;

		var tifFormats = function tifFormats(format) {
			if (format == 'tif' || format == 'lsm' || format == 'flex')
			return 'tif';
		} */

		console.log(req.params);

		var p = req.params;
		var inputImage = p.identifier;

		p.rotation = Number(p.rotation);
		if (p.region == 'full' && p.size == 'full' && p.rotation == 0) {
			sharp(inputImage).png().pipe(res);
		} else if (p.rotation == 0 && p.size == 'full' ) {
			var r = getRegion(p.region);
			sharp(inputImage).extract(r.y, r.x, r.w, r.h).png().pipe(res);
//			sharp(inputImage).png().pipe(res);
		} else if (p.rotation == 0 && p.region == 'full') {
			console.log('Size: ');
			var s = getSize(p.size,null,null);
			console.log('s exists');
			sharp(inputImage).resize(s.w, s.h).png().pipe(res);
		} else if (p.rotation == 0) {
			console.log('Region: ');
			var r = getRegion(p.region,null,null);
			console.log('Size: ');
			var s = getSize(p.size,null,null);
			console.log('s exists');
			sharp(inputImage).extract(r.y, r.x, r.w, r.h).resize(s.w, s.h).png().pipe(res);
//			sharp(inputImage).png().pipe(res);
		}


		//res.writeHead(200, {'Content-Type': 'image/png'});
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
