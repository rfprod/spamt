'use strict';

const express = require('express'),
	routes = require('./app/routes/index.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	session = require('express-session'),
	MongoStore = require('connect-mongodb-session')(session),
	app = express(),
	expressWs = require('express-ws')(app), // eslint-disable-line no-unused-vars
	cluster = require('cluster'),
	os = require('os');
let clusterStop = false;

if (!process.env.OPENSHIFT_MONGODB_DB_HOST) {
	require('dotenv').load();
}
require('./app/config/passport')(passport);

const mongo_uri = process.env.MONGO_URI || process.env.OPENSHIFT_MONGODB_DB_URL;
mongoose.connect(mongo_uri);

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/node_modules', express.static(process.cwd() + '/node_modules'));

if (process.env.OPENSHIFT_MONGODB_DB_HOST) {
	const store = new MongoStore({
		uri: mongo_uri,
		collection: 'clientSessions'
	});
	app.use(session({secret:'secretSPAMT', resave:false, saveUninitialized:true, store: store , cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 1 // 1 day 
	} }));
}else{
	app.use(session({secret:'secretWhoami', resave:false, saveUninitialized:true}));
}
app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
	ip = process.env.OPENSHIFT_NODEJS_IP; // "127.0.0.1" is not specified here on purpose, this env var should be included in .openshift.env

function terminator (sig) {
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
