module.exports = function index2(app, passport, hashPassword, db, sendByGmail) {

	var express = require('express');
	var router = express.Router();
	var path = require('path');
	var crypto = require('crypto');
	var moment = require('moment');
	var url = require('url');
	var querystring = require('querystring');
	var flash = require('connect-flash');
	// Using Jade templates
	var jade = require('jade');

	// route middleware that will happen on every request: here we log the requests happening
	router.use(function(req, res, next) {
		// log each request to the console
		console.log(req.method, req.url);
		// continue doing what we were doing and go to the route
		next();	
	});

	// Introduction page
	router.get('/', function (req, res) {
		res.render('index', { user : req.user });
	});

	// Registration page
	router.get('/register', function(req, res) {
		res.render('register', { });
	});

	// Registration post
	router.post('/register', function(req, res) {
		console.log("Started: post( /register , function(req, res) { ...");
		// log each request to the console
		console.log(req.body.username, req.url);

		// making the salt
		var saltLength = 64;
		crypto.randomBytes(saltLength, function (ex, buf) {
			if (ex) throw ex;
			var salt = buf.toString();
			hash = hashPassword( req.body.password, salt);
			db.run("INSERT INTO users (username, email, password, salt, valid) VALUES ( $username , $email , $password , $salt, $valid )", 
			{$email:req.body.email, $username:req.body.username, $password:hash, $salt:salt, $valid:true});

			return res.render('registeredUser');
		});
	});

	// Registration by mail page
	router.get('/registerByEmail', function(req, res) {
		res.render('registerByEmail', { });
	});
	// Registration post
	var registrationBaseUrl = '/registrationConfirmation';

	router.post('/registerByEmail', function(req, res) {
		console.log("Started: post( /registerByEmail , function(req, res) { ...");

		// Send Register email
		var saltLength = 64;
		var timeStamp = moment(new Date());
		crypto.randomBytes(saltLength, function (ex, buf) {
			if (ex) throw ex;
			var salt = buf.toString();
			hash = hashPassword( req.body.password, salt);

			db.run("INSERT INTO users (username, email, password, salt, valid) VALUES ( $username , $email , $password , $salt, $valid )", 
			{$email:req.body.email, $username:req.body.username, $password:hash, $salt:salt, $valid:false});

			var sender = "Michael Barbier <michael.barbier@gmail.com>";
			var receiver = req.body.email;
			var subject = "Registration FWM: to " + receiver;

			var confirmationQuery = querystring.stringify({"email":req.body.email, "password": hash});
			var urlObj = { 'protocol': app.get('protocol'), 'hostname':app.get('host'), 'host':app.get('Host'), 'port':app.get('port'), 'pathname': registrationBaseUrl, 'search' : confirmationQuery };
			var confirmationUrl = url.format(urlObj);
			var contentText = "You receive this email because someone (probably you), used this email-address to "
				+ "Please click on the following link to confirm your submitted credentials to sign in\n:  " + confirmationUrl;
			var contentHtml = jade.renderFile(  path.join(__dirname, '../views/registrationEmailContent.jade' ), { pageData: { 'email':req.body.email, 'url':confirmationUrl, 'ref':timeStamp } } );
			console.log(contentHtml);

			sendByGmail( sender, receiver, contentHtml, contentText, subject );
		});
		return res.render( 'registrationByEmail', { pageData:{ ref:timeStamp } } );

	});

	// Registration confirmation post
	router.get(registrationBaseUrl, function(req, res) {
		console.log("Started: get( /registrationConfirmation , function(req, res) { ...");
		console.log("Email: " + req.query.email);
		console.log("Password: " + req.query.password);
		db.serialize(function() {
			db.get("SELECT * FROM users", function(err, row) {
				if (!row) {
					console.log(req.query.email);
					console.log(req.query.password);
					console.log("No row in select salt with email and password");
				} else {
					console.log("ok salt found, we move on");
					if (row.password == req.query.password) {
						db.run("UPDATE users SET valid = $valid WHERE email = $email", {$valid:true, $email:req.query.email.toString()});
						console.log("email registration confirmation SUCCES");
						return res.redirect('/login',{ message: 'Registration succesfull, please sign in'});
					} else {
						console.log("false email registration confirmation FAILED");
						return res.redirect('/registerByEmail');
					}
				}
			});
		});
	});

	// Login page
	router.get('/login', function(req, res) {
		res.render('login', { message: req.flash('info') } );
	});

	// Login post
	router.post('/login', function(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			if (err) {
				console.log('Error: ' + err.message);
				req.flash('info', 'Error occured during login: ' + err.message + '\nPlease retry');
				return res.redirect('/login');
				//return next(err);
			}
			if (!user) {
				console.log("Error, !user");
				req.flash('info', 'Not a valid user/password combination\nPlease retry');
				return res.redirect('/login');
			}
			req.logIn(user, function(err) {
				if (err) { return next(err); }
				return res.redirect('/users/home/');
			});
		})(req, res, next);
	});

	// Logout
	router.get('/logout', function(req, res) {
		req.logOut();
		req.session.destroy(function (err) {
			res.redirect('/'); //Inside a callback… bulletproof!
		});
	});
	
	return router;
}	