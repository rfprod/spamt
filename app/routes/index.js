'use strict';

const path = process.cwd();

module.exports = function(app, passport, User, Query, SrvInfo, DataInit, syncRec, JWT, mailTransporter) { // eslint-disable-line no-unused-vars

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
* CORS headers
*/

	app.all('/*', function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
		res.header('Access-Control-Expose-Headers', 'userTokenUpdate');
		if (req.method == 'OPTIONS') res.status(200).end();
		else next();
	});

/*
*	Mailer config
*/
	function sendAccessLink(recipientEmail, accessLink, callback) {
		if (recipientEmail && accessLink) {
			let mailOptions = {
				from: '"SPAMT 👥" <'+process.env.MAILER_EMAIL+'>',
				to: recipientEmail,
				subject: 'SPAMT: controls access ✔',
				text: 'SPAMT: Controls access was requested using your email address.\nIf you did not request it, ignore this message.\nIf you requested access, follow the link: '+accessLink+'.', // plaintext body
				html: '<h3>SPAMT: Controls access was requested using your email address.</h3><p>If you did not request it, ignore this message.</p><p>If you requested access, follow the link: '+accessLink+'.</p>' // html body
			};
			mailTransporter.sendMail(mailOptions, (err, info) => {
				if (err) throw err;
				console.log('Message sent: ' + info.response);
				if (callback) { callback(); }
			});
		}
	}

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
				*	update Queries collection
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
			output = { message: 'Missing mandatory request parameter - name.' };
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
				output = { message: 'Wrong mandatory request parameter - endpoint_uri.' };
			}
		} else {
			output = { message: 'Missing mandatory request parameter - endpoint_uri.' };
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
				output = { message: 'Wrong mandatory request parameter - endpoint_uri.' };
			}
		} else {
			output = { message: 'Missing mandatory request parameter - endpoint_uri.' };
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
				output = { message: 'Wrong mandatory request parameter - endpoint_uri.' };
			}
		} else {
			output = { message: 'Missing mandatory request parameter - endpoint_uri.' };
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

// Administration endpoints
	app.get('/request/access', (req, res) => {
		/**
		* request controls access
		* generates token and sends link to user email
		*/
		const userEmail = req.query.email;
		if (userEmail) {
			User.find({'userExtended.email': userEmail}, (err, docs) => {
				if (err) throw err;
				if (!docs.length) {
					res.status(401).json({message: 'Unknown user'});
				} else {
					const user = docs[0];
					const storedSalt = (user.salt) ? user.salt : null;
					const expirationDate = new Date();
					expirationDate.setDate(expirationDate.getDate() + 7); // expires in one week
					const payload = {
						id: user._id,
						login: user.userExtended.login,
						email: user.userExtended.email,
						role: user.role,
						expires: expirationDate.getTime()
					};
					const tokenObj = JWT.generateJWToken(payload, storedSalt);
					// console.log(payload, tokenObj);
					JWT.setUserJWToken(user._id, tokenObj, () => {
						let accessLink = process.env.APP_URL + '#/controls?user_token=' + tokenObj.token;
						sendAccessLink(userEmail, accessLink, () => {
							res.status(200).json({message: 'access link was sent to provided email address'});
						});
					});
					// update lastLogin
					User.update({'userExtended.email': userEmail}, {$set: {'lastLogin': new Date().getTime()}}, (err, res) => {
						if (err) throw err;
						console.log('last login updated', res);
					});
				}
			});
		} else {
			res.status(401).json({message: 'Missing mandatory request param: \'email\''});
		}
	});

	app.all('/controls/*', (req, res, next) => {
		/**
		* /controls endpoint access restriction
		* based on bearer token
		*/
		passport.authenticate('token-bearer', { session: false }, function(err, user, info) {
			let userToken = req.query.user_token; // token from url var
			if (typeof userToken == 'undefined') userToken = req.body.user_token; // token from request body
			if (userToken) {
				JWT.checkJWTokenExpiration(userToken, (tokenStatus) => {
					req.renewedToken = false;
					console.log('token status:', tokenStatus);
					if (tokenStatus.expired) return res.status(401).json({ message: 'token expired' });
					//if (tokenStatus.renew) return res.status(200).json({ to_be_configured: 'this event should regenerate user token' });
					if (tokenStatus.renew) {
						JWT.renewUserToken(req, (tokenObj) => {
							console.log('new token:', tokenObj);
							req.renewedTokenObj = tokenObj;
							return next();
						});
					}
					else if (info.statusCode == 200) return next();
					else if (!info.statusCode) return res.status(401).json({ message: info });
					else return res.status(info.statusCode).json({ message: info.message });
				});
			} else {
				const responseMessage = {message: 'Token missing \'user_token\''};
				console.log('responseMessage:', responseMessage);
				res.status(401).json(responseMessage);
			}
		})(req,res);
	});

	app.get('/controls/me', (req, res) => {
		/**
		* get authenticated user details
		*/
		let userToken = req.query.user_token;
		User.find({jwToken: userToken}, (err, docs) => {
			if (err) throw err;
			let output = {};
			docs = docs[0];
			output.id = docs._id;
			output.last_login = docs.lastLogin;
			output.registered = docs.registered;
			output.role = docs.role;
			output.login = docs.userExtended.login;
			output.full_name = docs.userExtended.firstName + ' ' + docs.userExtended.lastName;
			res.status(200).json(output);
		});
	});

	app.get('/controls/list/users', (req, res) => {
		/**
		* get users list
		* returns all records for now
		*/
		/**
		* TODO
		*	return 20 records per request similarly to /controls/list/queries
		*	query parameter 'page' should control records offset
		*/
		User.find({}, (err, docs) => {
			if (err) { throw err; }
			let resData = [],
				dataUnit = {};
			for (let i in docs) {
				if (docs[i]) {
					dataUnit = {
						id: docs[i]._id,
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
					res.status(200).send(resData);
				}
			});
		});
	});

	app.get('/controls/list/queries', (req, res) => {
		/**
		* get queries list
		* returns 20 records per request
		* query parameter 'page' controls records offset
		*/
		const page = (req.query.page) ? req.query.page : 1;
		const limit = 20;
		const offset = (page > 1) ? limit * page : 0;
		Query.aggregate({$skip: offset}, {$limit: limit}, (err, docs) => {
			if (err) { throw err; }
			let resData = [],
				dataUnit = {};
			for (let i in docs) {
				if (docs[i]) {
					dataUnit = {
						id: docs[i]._id,
						name:	docs[i].name,
						weight:	docs[i].weight,
						timestamp: docs[i].timestamp
					};
					resData.push(dataUnit);
				}
			}
			res.setHeader('Cache-Control', 'no-cache, no-store');
			res.format({
				'application/json': function(){
					res.status(200).send(resData);
				}
			});
		});
	});

	app.get('/controls/logout', (req, res) => {
		/**
		* log out authenticated user
		* resets current user token
		*/
		let userToken = req.query.user_token; // token from url var
		JWT.resetUserJWToken(null, userToken, (err) => {
			if (err) { res.status(401).json(err); }
			else { res.status(200).json({message: 'logged out, token reset'}); }
		});
	});

/**
*	social networks authentication
*/
	app.get('/auth/soundcloud', passport.authenticate('soundcloud'));
	app.get('/auth/soundcloud/callback', passport.authenticate('soundcloud', {
		successRedirect: process.env.APP_URL + '#/user/dashboard',
		failureRedirect: process.env.APP_URL + '#/user'
	}));
	app.get('/auth/twitter', passport.authenticate('twitter'));
	app.get('/auth/twitter/callback', passport.authenticate('twitter', {
		successRedirect: process.env.APP_URL + '#/user/dashboard',
		failureRedirect: process.env.APP_URL + '#/user'
	}));
	app.get('/auth/logout', (req, res) => {
		req.logout();
		res.status(200).json({message: 'logged out successfully'});
	});

/**
*	utility functions for checking social authentication
*/
	function isLoggedIn(req, res, next){
		if (req.isAuthenticated()) return next();
		else res.redirect(process.env.APP_URL + '#/user');
	}

};
