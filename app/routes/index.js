'use strict';

const path = process.cwd(),
	User = require('../models/users.js'),
	srvInfo = require('../utils/srv-info.js');

module.exports = function (app, passport) { // eslint-disable-line no-unused-vars

	app.get('/', (req, res) => {
		res.sendFile(path + '/public/index.html');
	});

	app.get('/dummy', (req, res) => {
		const headers = req.headers;
		console.log('headers',headers);
		const output = '{\"success\":true}';

		res.format({
			'application/json': function(){
				res.send(output);
			}
		});
	});
	
	app.get('/users', (req, res) => {
		User.find({}, (err,doc) => {
			if (err) { throw err; }
			console.log('users list',doc);
			res.setHeader('Cache-Control', 'no-cache, no-store');
			res.format({
				'application/json': function(){
					res.send(doc);
				}
			});
		});
	});

	app.get('/app-diag/static', (req, res) => {
		res.setHeader('Cache-Control', 'no-cache, no-store');
		res.format({
			'application/json': function(){
				res.send(srvInfo['static']());
			}
		});
	});

	app.ws('/app-diag/dynamic', (ws) => {
		console.log('websocket opened /app-diag/dynamic');
		let sender = null;
		ws.on('message', (msg) => {
			console.log('message:',msg);
			function sendData () {
				ws.send(JSON.stringify(srvInfo['dynamic']()), (err) => {if (err) throw err;});
			}
			if (JSON.parse(msg).action === 'get') {
				console.log('ws open, data sending started');
				sendData();
				sender = setInterval(() => {
					sendData();
				}, 5000);
			}
			if (JSON.parse(msg).action === 'pause') {
				console.log('ws open, data sending paused');
				clearInterval(sender);
			}
		});
		ws.on('close', () => {
			console.log('Persistent websocket: Client disconnected.');
			ws._socket.setKeepAlive(true);
			clearInterval(sender);
		});
		ws.on('error', () => {console.log('Persistent websocket: ERROR');});
	});
};
