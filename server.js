'use strict';

const express = require('express'),
	routes = require('./app/routes/index.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	session = require('express-session'),
	MongoStore = require('connect-mongodb-session')(session),
	app = express(),
	expressWs = require('express-ws')(app), // eslint-disable-line no-unused-vars
	bodyParser = require('body-parser'),
	jwt = require('jwt-simple'),
	flash = require('connect-flash'),
	thenReq = require('then-request'),
	nodemailer = require('nodemailer'),
	crypto = require('crypto'),
	cluster = require('cluster'),
	os = require('os');
let clusterStop = false;

if (!process.env.OPENSHIFT_MONGODB_DB_HOST) {
	require('dotenv').load();
}
require('./app/config/passport')(passport);

const mongo_uri = process.env.MONGO_URI || process.env.OPENSHIFT_MONGODB_DB_URL;
mongoose.connect(mongo_uri);
/*
*	database models and data initialization methods
*/
const User = require('./app/models/users.js'),
	Query = require('./app/models/queries.js'),
	SrvInfo = require('./app/utils/srv-info.js'),
	DataInit = require('./app/utils/data-init.js');
/*
*	JWT methods
*/
const JWT = require('./app/utils/jwt-methods.js')(crypto, jwt, User);

/*
*	Soundcloud API wrapper
*/
const SC = require('./app/utils/soundcloud-api-wrapper.js');

/*
*	Twitter API wrapper
*/
const TWTR = require('./app/utils/twitter-api-wrapper.js');

process.title = 'spamt';

const cwd = process.cwd();

app.use('/public', express.static(cwd + '/public'));
app.use('/node_modules', express.static(cwd + '/node_modules'));
app.use('/systemjs.config.js', express.static(cwd + '/systemjs.config.js'));
app.use('/systemjs.config.extras.js', express.static(cwd + '/systemjs.config.extras.js'));
app.use((req, res, next) => {
	/*
	*	this is required for angular to load urls properly when user requests url directly, e.g.
	*	current conditions: client index page is served fro all request
	*	which do not include control words: api, css, fonts, img, js
	*	control words explanation:
	*	api - is part of path that returnd data over REST API
	* css, fonts, img, js - are directories containing client files
	*/
	// console.log('req.path:', req.path);
	if (/(api|css|fonts|img|js|node_modules)/.test(req.path)) {
		return next();
	} else {
		res.sendFile(cwd + '/public/index.html');
	}
});
// headers config for all Express routes
app.all('/*', function(req, res, next) {
	// CORS headers
	res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain if needed
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
	// add headers to be exposed
	res.header('Access-Control-Expose-Headers', 'userTokenUpdate');
	// cache control
	res.header('Cache-Control', 'public, no-cache, no-store, must-ravalidate, max-age=0');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	// handle OPTIONS method
	if (req.method == 'OPTIONS') res.status(200).end();
	else next();
});

if (process.env.OPENSHIFT_MONGODB_DB_HOST) {
	const store = new MongoStore({
		uri: mongo_uri,
		collection: 'clientSessions'
	});
	app.use(session({secret:'secretSPAMT', resave:false, saveUninitialized:true, store: store , cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 1 // 1 day 
	} }));
}else{
	app.use(session({secret:'secretSPAMT', resave:false, saveUninitialized:true}));
}
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(flash());

/*
* nodemailer usage notice:
* To use Gmail you may need to configure "Allow Less Secure Apps" (https://www.google.com/settings/security/lesssecureapps)
* in your Gmail account unless you are using 2FA
* in which case you would have to create an Application Specific password (https://security.google.com/settings/security/apppasswords).
* You also may need to unlock your account with "Allow access to your Google account" (https://accounts.google.com/DisplayUnlockCaptcha)
* to use SMTP.
*/
let smtpConfig = {
	host: process.env.MAILER_HOST,
	port: process.env.MAILER_PORT,
	secure: true, // use SSL
	auth: {
		type: 'OAuth2',
		user: process.env.MAILER_EMAIL,
		clientId: process.env.MAILER_CLIENT_ID,
		clientSecret: process.env.MAILER_CLIENT_SECRET,
		refreshToken: process.env.MAILER_REFRESH_TOKEN,
		accessToken: 'empty'
	}
};
// set proxy for smtp for development environment
if (process.env.DEV_ENV) {
	console.log('mail transporter >> development environment launch detected, setting proxy for smtpConfig');
	smtpConfig.proxy = 'socks5://127.0.0.1:9150/';
}

const mailTransporter = nodemailer.createTransport(smtpConfig); // reusable transporter object using the default SMTP transport
mailTransporter.verify((err, success) => {
	if (err) {
		console.log('Mail transporter diag error >>', err);
	} else {
		console.log('Mail transporter diag success >>', success);
	}
});
// enable support for socks URLs for development environment
if (process.env.DEV_ENV) {
	console.log('mail transporter >> development environment launch detected, enabling support for socks proxy urls');
	mailTransporter.set('proxy_socks_module', require('socks'));
}

routes(app, passport, User, Query, SrvInfo, DataInit, thenReq, JWT, mailTransporter, crypto, SC, TWTR);

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
	ip = process.env.OPENSHIFT_NODEJS_IP; // "127.0.0.1" is not specified here on purpose, this env var should be included in .openshift.env

function terminator(sig) {
	if (typeof sig === 'string') {
		console.log('%s: Received %s - terminating app '+sig+'...', Date(Date.now()));
		if (cluster.isMaster && !clusterStop) {
			cluster.fork();
		}else{
			process.exit(0);
			if (!cluster.isMaster) { console.log('%s: Node server stopped', Date(Date.now())); }
		}
	}
}

if (!ip){
	/*
	*   development
	*/
	app.listen(port, () => {
		console.log('$> development > Node.js listening on port '+port+'...');
	});
}else{
	/*
	*   deployment - OPENSHIFT SPECIFIC
	*/
	(() => {
		/*
		*   termination handlers
		*/
		process.on('exit', () => { terminator('exit'); });
		// Removed 'SIGPIPE' from the list - bugz 852598.
		['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
			'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
		].forEach((element) => {
			process.on(element, () => {
				clusterStop = true;
				terminator(element);
			});
		});
	})();

	if (cluster.isMaster) {
		const workersCount = os.cpus().length;
		console.log('%s: Node.js listening on '+ip+':'+port+'...');
		console.log('Cluster setup, workers count:',workersCount);
		for (let i=0; i<workersCount; i++) {
			console.log('Starting worker',i);
			cluster.fork();
		}
		cluster.on('online', (worker,error) => {
			if (error) throw error;
			console.log('Worker pid',worker.process.pid,'is online');
		});
		cluster.on('exit', (worker, code, signal) => {
			console.log('Worker pid',worker.process.pid,'exited with code',code,'and signal',signal);
			if (!clusterStop) {
				console.log('Starting a new worker...');
				cluster.fork();
			}
		});
	}else{
		app.listen(port, ip, () => {
			console.log('%s: Node.js listening on '+ip+':'+port+'...');
		});
	}
}
