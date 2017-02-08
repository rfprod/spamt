'use strict';

const path = process.cwd();

module.exports = function(app, passport, User, Query, SrvInfo, DataInit, syncRec) { // eslint-disable-line no-unused-vars

/*
*	check if data init is needed
*	data is initialized with dummy data if the DB is empty on server start
*/

	DataInit.initData();

/*
*	Soundcloud API wrapper
*/
	class SC {
		constructor() {
			this.apiUrl = 'https://api.soundcloud.com/';
			this.regExp = {
				userDetails: /http(s)?\:\/\/api\.soundcloud\.com\/users\/[0-9]+\/(tracks|playlists|favorites|followers|followings)/,
				userTrackDownload: /http(s)?\:\/\/api\.soundcloud\.com\/tracks\/[0-9]+\/download/,
				userTrackStream: /http(s)?\:\/\/api\.soundcloud\.com\/tracks\/[0-9]+\/stream/
			};
			this.endpoints = { resolve: 'resolve' };
			this.clientID = process.env.SOUNDCLOUD_CLIENT_ID;
			this.clientIDparam = 'client_id=' + this.clientID;
		}

		resolve(path) {
			console.log('resolving path: ', path);
			const url = this.apiUrl + this.endpoints.resolve + '?url=' + path + '&' + this.clientIDparam;
			return syncRec('GET', url);
		}

		getURI(apiUri, options) {
			console.log('getting sc details by apiUri: ', apiUri);
			const url = apiUri + '?' + this.clientIDparam;
			return (options) ? syncRec('GET', url, options) : syncRec('GET', url);
		}
	}

	const SCapi = new SC();

/*
*	routes
*/

	app.get('/', (req, res) => {
		/**
		*	serve application page
		*/
		res.sendFile(path + '/public/index.html');
	});

	app.get('/sc/get/user', (req, res) => {
		/**
		*	Resolves soundcloud resource to get user data,
		*	return response if user
		*/
		let scUserName = req.query.name,
			output = undefined;

		if (scUserName) {
			if (scUserName.indexOf('/')) {
				/*
				*	if provided param contains at least one slash,
				*	split and take only first part
				*/
				scUserName = scUserName.split('/')[0];
			}

			const resolveRequest = SCapi.resolve('https://soundcloud.com/' + scUserName);

			if (resolveRequest.statusCode === 200) {
				output = JSON.parse(resolveRequest.getBody());
				/*
				*	TODO update Queries collection
				*/
				Query.find({}, (err, docs) => {
					if (err) throw err;
					const now = new Date().getTime();
					if (docs.length === 0) {
						let newQuery = new Query();
						newQuery.name = scUserName;
						newQuery.weight = 1;
						newQuery.timestamp = now;
						newQuery.save(err => {
							if (err) throw err;
							console.log('new query registered');
						});
					} else {
						console.log('queries exist');
						searchQueryLoop:
						for (let i in docs) {
							const item = docs[i];
							if (item.name === scUserName) {
								// update db record
								const newWeight = item.weight + 1;
								Query.update(
									{'name': scUserName},
									{$set:{'weight':newWeight, 'timestamp':now}},
									(err,data) => {
										if (err) { throw err; }
										console.log('updated existing query:', JSON.stringify(data));
									}
								);
								break searchQueryLoop;
							}
							console.log('docs.length, i:', docs.length, i);
							if (i == docs.length - 1) {
								// add new query
								let newQuery = new Query();
								newQuery.name = scUserName;
								newQuery.weight = 1;
								newQuery.timestamp = now;
								newQuery.save(err => {
									if (err) throw err;
									console.log('new query registered');
								});
							}
						}
					}
				});
			} else {
				/*
				*	proxy errors from soundcloud API
				*/
				output = resolveRequest.body;
			}
		} else {
			output = { error: 'Missing mandatory request parameter - name.' };
		}

		res.setHeader('Cache-Control', 'no-cache, no-store');
		res.format({
			'application/json': function(){
				if (output.error) res.status(400);
				res.send(output);
			}
		});
	});

	app.get('/sc/get/queries', (req, res) => {
		/**
		*	get most popular queries
		*/
		let output = {};
		Query.find({}, (err, docs) => {
			if (err) throw err;
			docs.sort((a, b) => {
				if (a.weight > b.weight) { return -1; }
				if (a.weight < b.weight) { return 1; }
				return 0;
			});
			console.log(docs);
			output.data = (docs.length > 30) ? docs.slice(0, 30) : docs;
			res.setHeader('Cache-Control', 'no-cache, no-store');
			res.format({
				'application/json': function(){
					if (output.error) res.status(400);
					res.send(output);
				}
			});
		});
	});

	app.get('/sc/get/user/details', (req, res) => {
		/**
		*	Requests and returns soundcloud users details by type:
		* 'tracks', 'playlists', 'favorites', 'followers', 'followings'
		*/
		const scEndpointUri = req.query.endpoint_uri;
		let output = undefined;

		if (scEndpointUri) {

			if (SCapi.regExp.userDetails.test(scEndpointUri)) {
				const resolveRequest = SCapi.getURI(scEndpointUri);

				if (resolveRequest.statusCode === 200) {
					output = JSON.parse(resolveRequest.getBody());
				} else {
					/*
					*	proxy errors from soundcloud API
					*/
					output = resolveRequest.body;
				}
			} else {
				output = { error: 'Wrong mandatory request parameter - endpoint_uri.' };
			}
		} else {
			output = { error: 'Missing mandatory request parameter - endpoint_uri.' };
		}

		res.setHeader('Cache-Control', 'no-cache, no-store');
		res.format({
			'application/json': function(){
				if (output.error) res.status(400);
				res.send(output);
			}
		});
	});

	app.get('/sc/get/user/track/download', (req, res) => {
		/**
		*	Requests and returns soundcloud user's downloadable track
		*/
		const scEndpointUri = req.query.endpoint_uri;
		let resolveRequest = undefined;
		let output = undefined;

		if (scEndpointUri) {

			if (SCapi.regExp.userTrackDownload.test(scEndpointUri)) {
				resolveRequest = SCapi.getURI(scEndpointUri);
				//console.log('resolveRequest: ', resolveRequest);

				if (resolveRequest.statusCode === 200) {
					output = resolveRequest.getBody();
				} else {
					/*
					*	proxy errors from soundcloud API
					*/
					output = resolveRequest.body;
				}
			} else {
				output = { error: 'Wrong mandatory request parameter - endpoint_uri.' };
			}
		} else {
			output = { error: 'Missing mandatory request parameter - endpoint_uri.' };
		}

		res.setHeader('Cache-Control', 'no-cache, no-store');
		if (output.error) {
			res.format({
				'application/json': function(){
					res.status(400).send(output);
				}
			});
		} else {
			res.setHeader('Content-Disposition', resolveRequest.headers['content-disposition']);
			res.setHeader('Accept-Ranges', resolveRequest.headers['accept-ranges']);
			res.setHeader('Content-Type', resolveRequest.headers['content-type']);
			res.setHeader('Content-Length', resolveRequest.headers['content-length']);
			res.setHeader('X-AMZ-Meta-Duration', resolveRequest.headers['x-amz-meta-duration']);
			res.setHeader('X-AMZ-Meta-File-Type', resolveRequest.headers['x-amz-meta-file-type']);
			res.send(output);
		}
	});

	app.get('/sc/get/user/track/stream', (req, res) => {
		/**
		*	Requests and returns soundcloud user's track preview url
		*/
		const scEndpointUri = req.query.endpoint_uri;
		let resolveRequest = undefined;
		let output = undefined;

		if (scEndpointUri) {

			if (SCapi.regExp.userTrackStream.test(scEndpointUri)) {
				resolveRequest = SCapi.getURI(scEndpointUri, { followRedirects: false });
				//console.log('resolveRequest: ', resolveRequest);

				if (resolveRequest.statusCode === 200) {
					/*
					*	send client a location to be loaded as <source src='...'>
					*/
					output = { location: resolveRequest.headers['location'] };
				} else {
					/*
					*	proxy errors from soundcloud API
					*/
					output = resolveRequest.body;
				}
			} else {
				output = { error: 'Wrong mandatory request parameter - endpoint_uri.' };
			}
		} else {
			output = { error: 'Missing mandatory request parameter - endpoint_uri.' };
		}

		res.setHeader('Cache-Control', 'no-cache, no-store');
		if (output.error) {
			res.format({
				'application/json': function(){
					res.status(400).send(output);
				}
			});
		} else {
			res.setHeader('Content-Type', resolveRequest.headers['content-type']);
			res.setHeader('Location', resolveRequest.headers['location']);
			res.send(output);
		}
	});

	app.get('/users/list', (req, res) => {
		/**
		*	TODO
		* should return data depending on access privileges, i.e.
		*	- no auth: id, firstName, registered
		* - auth: id, firstName, lastName, role, registered, lastLogin, city, country
		*/
		User.find({}, (err, docs) => {
			if (err) { throw err; }
			console.log('users list', docs);
			let resData = [],
				dataUnit = {};
			for (let i in docs) {
				if (docs[i]) {
					dataUnit = {
						id: docs[i].id,
						role:	docs[i].role,
						registered:	docs[i].registered,
						lastLogin: docs[i].lastLogin,
						email: docs[i].userExtended.email,
						firstName: docs[i].userExtended.firstName,
						lastName: docs[i].userExtended.lastName,
						city: docs[i].userExtended.city,
						country: docs[i].userExtended.country
					};
					resData.push(dataUnit);
				}
			}
			res.setHeader('Cache-Control', 'no-cache, no-store');
			res.format({
				'application/json': function(){
					res.send(resData);
				}
			});
		});
	});

	app.get('/app-diag/usage', (req, res) => {
		/**
		*	number of users and administrators 
		*/
		User.find({}, (err, docs) => {
			if (err) { throw err; }
			console.log('count list', docs.length);
			let stats = [
				{ key: 'Users', y: 0},
				{ key: 'Admins', y: 0}
			];
			for (let i in docs) {
				if (docs[i]) {
					if (docs[i].role === 'admin') stats[1].y++;
					else stats[0].y++;
				}
			}
			res.setHeader('Cache-Control', 'no-cache, no-store');
			res.format({
				'application/json': function(){
					res.send(stats);
				}
			});
		});
	});

	app.get('/app-diag/static', (req, res) => {
		/**
		* static server information
		*/
		res.setHeader('Cache-Control', 'no-cache, no-store');
		res.format({
			'application/json': function(){
				res.send(SrvInfo['static']());
			}
		});
	});

	app.ws('/app-diag/dynamic', (ws) => {
		/**
		* dynamic server information
		*/
		console.log('websocket opened /app-diag/dynamic');
		let sender = null;
		ws.on('message', (msg) => {
			console.log('message:',msg);
			function sendData () {
				ws.send(JSON.stringify(SrvInfo['dynamic']()), (err) => {if (err) throw err;});
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
