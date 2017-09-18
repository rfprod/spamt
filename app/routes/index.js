'use strict';

const path = process.cwd();

module.exports = function(app, passport, User, Query, SrvInfo, DataInit, thenReq, JWT, mailTransporter, crypto, SC, TWTR) { // eslint-disable-line no-unused-vars
/**
*	check if data init is needed
*	data is initialized with dummy data if the DB is empty on server start
*/
	DataInit.initData();
	// eslint-disable-next-line
/**
*	Soundcloud API wrapper
*/
	const SCapi = new SC(thenReq);
	// eslint-disable-next-line
/**
*	Twitter API wrapper
*/
	const TwitterAPI = new TWTR(thenReq, crypto);
	// eslint-disable-next-line
/**
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
				if (err) {
					if (!callback){
						throw err;
					} else {
						callback(err);
					}
				} else {
					console.log('Message sent: ' + info.response);
					if (callback) { callback(); }
				}
			});
		}
	}
	// eslint-disable-next-line
/**
*	routes
*/
	app.get('/', (req, res) => {
		/**
		*	serve application page
		*/
		res.sendFile(path + '/public/index.html');
	});

	app.get('/api/sc/get/user', (req, res) => {
		/**
		*	Resolves soundcloud resource to get user data,
		*	return response if user
		*/
		let scUserName = req.query.name;
		let output = undefined;

		if (scUserName) {
			if (scUserName.indexOf('/')) {
				/**
				*	if provided param contains at least one slash,
				*	split and take only first part
				*/
				scUserName = scUserName.split('/')[0];
			}

			SCapi.resolve('https://soundcloud.com/' + scUserName).done(SCres => {
				if (SCres.statusCode < 300) {
					/**
					*	update Queries collection
					*/
					output = JSON.parse(SCres.getBody());
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
								if (item.name === scUserName) { // update db record
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
								if (i == docs.length - 1) { // add new query
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
					/**
					*	proxy errors from soundcloud API
					*/
					output = { error: JSON.parse(SCres.body.toString('UTF8')).errors[0] };
				}
				res.setHeader('Cache-Control', 'no-cache, no-store');
				res.format({
					'application/json': () => {
						if (output.error) { res.status(SCres.statusCode); }
						res.send(output);
					}
				});
			});
		} else {
			output = { error: 'Missing mandatory request parameter - name.' };
			res.setHeader('Cache-Control', 'no-cache, no-store');
			res.format({
				'application/json': () => {
					res.status(404).send(output);
				}
			});
		}
	});

	app.get('/api/sc/get/queries', (req, res) => {
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

	app.get('/api/sc/get/user/details', (req, res) => {
		/**
		*	Requests and returns soundcloud users details by type:
		* 'tracks', 'playlists', 'favorites', 'followers', 'followings'
		*/
		const scEndpointUri = req.query.endpoint_uri;
		let output = undefined, error = false;

		if (scEndpointUri) {
			if (SCapi.regExp.userDetails.test(scEndpointUri)) {
				SCapi.getURI(scEndpointUri).done(SCres => {
					if (SCres.statusCode < 300) { // parse successful request
						output = JSON.parse(SCres.getBody());
					} else { // proxy errors from soundcloud API
						output = { error: JSON.parse(SCres.body.toString('UTF8')).errors[0] };
					}
					res.setHeader('Cache-Control', 'no-cache, no-store');
					res.format({
						'application/json': () => {
							if (output.error) { res.status(SCres.statusCode); }
							res.send(output);
						}
					});
				});
			} else {
				output = { error: 'Wrong mandatory request parameter - endpoint_uri.' };
				error = true;
			}
		} else {
			output = { error: 'Missing mandatory request parameter - endpoint_uri.' };
			error = true;
		}

		if (error) {
			res.setHeader('Cache-Control', 'no-cache, no-store');
			res.format({
				'application/json': () => {
					res.status(404).send(output);
				}
			});
		}

	});

	app.get('/api/sc/get/user/track/download', (req, res) => {
		/**
		*	Requests and returns soundcloud user's downloadable track
		*/
		const scEndpointUri = req.query.endpoint_uri;
		let output = undefined, error = false;

		if (scEndpointUri) {
			if (SCapi.regExp.userTrackDownload.test(scEndpointUri)) {
				SCapi.getURI(scEndpointUri).done(SCres => {
					if (SCres.statusCode < 300) { // parse successful request - return file
						output = SCres.getBody();
					} else { // proxy errors from soundcloud API
						output = { error: JSON.parse(SCres.body.toString('UTF8')).errors[0] };
					}

					res.setHeader('Cache-Control', 'no-cache, no-store');
					if (!output.error) {
						res.setHeader('Content-Disposition', SCres.headers['content-disposition']);
						res.setHeader('Accept-Ranges', SCres.headers['accept-ranges']);
						res.setHeader('Content-Type', SCres.headers['content-type']);
						res.setHeader('Content-Length', SCres.headers['content-length']);
						res.setHeader('X-AMZ-Meta-Duration', SCres.headers['x-amz-meta-duration']);
						res.setHeader('X-AMZ-Meta-File-Type', SCres.headers['x-amz-meta-file-type']);
					}
					res.format({
						'application/json': () => {
							res.status(SCres.statusCode).send(output);
						}
					});
				});
			} else {
				output = { error: 'Wrong mandatory request parameter - endpoint_uri.' };
				error = true;
			}
		} else {
			output = { error: 'Missing mandatory request parameter - endpoint_uri.' };
			error = true;
		}

		if (error) {
			res.setHeader('Cache-Control', 'no-cache, no-store');
			res.format({
				'application/json': () => {
					res.status(404).send(output);
				}
			});
		}
	});

	app.get('/api/sc/get/user/track/stream', (req, res) => {
		/**
		*	Requests and returns soundcloud user's track preview url
		*/
		const scEndpointUri = req.query.endpoint_uri;
		let output = undefined, error = false;

		if (scEndpointUri) {
			if (SCapi.regExp.userTrackStream.test(scEndpointUri)) {
				SCapi.getURI(scEndpointUri, { followRedirects: false }).done(SCres => {
					if (SCres.statusCode < 400) { // parse successful request - send client a location to be loaded as <source src='...'>
						output = { location: SCres.headers['location'] };
					} else { // proxy errors from soundcloud API
						output = { error: JSON.parse(SCres.body.toString('UTF8')).errors[0] };
					}

					res.setHeader('Cache-Control', 'no-cache, no-store');
					if (!output.error) {
						res.setHeader('Content-Type', SCres.headers['content-type']);
						res.setHeader('Location', SCres.headers['location']);
					}
					if (SC.statusCode >= 400) {
						res.format({
							'application/json': () => {
								res.status(SCres.statusCode).send(output);
							}
						});
					} else {
						res.status(200).send(output);
					}
				});
			} else {
				output = { error: 'Wrong mandatory request parameter - endpoint_uri.' };
				error = false;
			}
		} else {
			output = { error: 'Missing mandatory request parameter - endpoint_uri.' };
			error = false;
		}

		if (error) {
			res.setHeader('Cache-Control', 'no-cache, no-store');
			res.format({
				'application/json': () => {
					res.status(404).send(output);
				}
			});
		}
	});

	app.get('/api/app-diag/usage', (req, res) => {
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

	app.get('/api/app-diag/static', (req, res) => {
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

	app.ws('/api/app-diag/dynamic', (ws) => {
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
			if (ws._socket) {
				ws._socket.setKeepAlive(true);
			}
			clearInterval(sender);
		});
		ws.on('error', () => {console.log('Persistent websocket: ERROR');});
	});
	// eslint-disable-next-line
/**
*	Administration endpoints
*/
	app.get('/api/request/access', (req, res) => {
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
						let accessLink = process.env.APP_URL + 'controls?user_token=' + tokenObj.token;
						sendAccessLink(userEmail, accessLink, (error) => {
							if (error) {
								res.status(500).json({message: 'mail transporter error'});
							} else {
								res.status(200).json({message: 'access link was sent to provided email address'});
							}
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

	app.all('/api/controls/*', (req, res, next) => {
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

	app.get('/api/controls/me', (req, res) => {
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

	app.get('/api/controls/list/users', (req, res) => {
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

	app.get('/api/controls/list/queries', (req, res) => {
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

	app.get('/api/controls/logout', (req, res) => {
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
	// eslint-disable-next-line
/**
*	social networks authentication
*/
	app.get('/api/auth/soundcloud', passport.authenticate('soundcloud'));
	app.get('/api/auth/soundcloud/callback', passport.authenticate('soundcloud', {
		successRedirect: process.env.APP_URL + 'user/dashboard',
		failureRedirect: process.env.APP_URL + 'user'
	}));
	app.get('/api/auth/twitter', passport.authenticate('twitter'));
	app.get('/api/auth/twitter/callback', passport.authenticate('twitter', {
		//successRedirect: process.env.APP_URL + '#/user?twitter_auth_error=false',
		failureRedirect: process.env.APP_URL + 'user?twitter_auth_error=true'
	}), (req, res) => {
		console.log('api/auth/twitter/callback', req.user._doc);
		const oauth_token = req.query.oauth_token;
		const oauth_verifier = req.query.oauth_verifier;
		if (!oauth_token && !oauth_verifier) {
			// this check is probably useless because failureRedirect is defined above
			res.redirect(process.env.APP_URL + 'user?twitter_auth_error=true');
		} else {
			User.update(
				{'twitter.id': req.user._doc.twitter.id},
				{$set:{'twitter.oauth_token': oauth_token, 'twitter.oauth_verifier': oauth_verifier}},
				(err, data) => {
					if (err) {
						//throw err;
						console.log(err);
						res.redirect(process.env.APP_URL + 'user?twitter_auth_error=true');
					}
					console.log('updated twitter tokens for user:', data);
					res.redirect(process.env.APP_URL + 'user?twitter_oauth_token=' + oauth_token + '&twitter_oauth_verifier=' + oauth_verifier);
				}
			);
		}
	});
	app.get('/api/auth/logout', (req, res) => {
		/**
		* log out authenticated user
		* resets current user token
		*/
		// console.log('/auth/logout, query:', req.query);
		const twitterToken = (req.query.twitter_token) ? req.query.twitter_token : '';
		const soundcloudToken = (req.query.soundcloud_token) ? req.query.soundcloud_token : '';
		console.log('twitterToken:', twitterToken);
		console.log('soundcloudToken:', soundcloudToken);
		if (!twitterToken && !soundcloudToken) {
			res.status(404).json({error: 'Missing user token'});
		}
		// reset oauth tokens
		if (twitterToken) {
			// for Twitter
			User.update(
				{'twitter.oauth_token': twitterToken},
				{$set:{'twitter.oauth_token':'', 'twitter.oauth_verifier':'', access_token:	'', token_secret: ''}},
				(err,data) => {
					if (err) { throw err; }
					console.log('twitter oauth tokens reset:', JSON.stringify(data));
				}
			);
		} else if (soundcloudToken) {
			// for Soundcloud
			/*
			*	TODO
			*	configure for Soundcloud probably like so
			*	
			*	User.update(
			*		{'soundcloud.oauth_token': soundcloudToken},
			*		{$set:{'soundcloud.oauth_token':'', 'soundcloud.oauth_verifier':''}},
			*		(err,data) => {
			*			if (err) { throw err; }
			*			console.log('soundcloud oauth tokens reset:', JSON.stringify(data));
			*		}
			*	);
			*/
		}
		if (twitterToken || soundcloudToken) {
			req.logout(); // drop session
			res.status(200).json({message: 'logged out successfully'});
		}
	});
	// eslint-disable-next-line
/*
*	Twitter endpoints
*/
	app.get('/api/auth/twitter/verify-credentials', (req, res) => {
		/**
		* log out authenticated user
		* resets current user token
		*/
		console.log('req.query:', req.query);
		const oauth_token = (req.query.oauth_token) ? req.query.oauth_token : '';
		res.setHeader('Cache-Control', 'no-cache, no-store');
		if (!oauth_token) {
			res.status(404).json({ error: 'Missing mandatory request parameter: twitter_token' });
		} else {
			User.find({'twitter.oauth_token': oauth_token}, (err, docs) => {
				if (err) { throw err; }
				if (docs[0]) {
					const access_token = docs[0].twitter.access_token;
					const token_secret = docs[0].twitter.token_secret;
					//res.status(200).json({ message: 'success ' + twitter_secret });					
					TwitterAPI.request('GET', TwitterAPI.endpoints.rest.account.get.verify_credentials, access_token, token_secret).done(TWTRres => {
						let output;
						if (TWTRres.statusCode < 300) { // parse successful request
							output = JSON.parse(TWTRres.getBody());
						} else { // proxy errors Twitter API
							let err = TWTRres.body.toString('UTF8');
							output = ((err.match(/[{}]/g))) ? { error: JSON.parse(err).errors[0] } : { error: err };
						}
						console.log('output:', output);
						res.status(TWTRres.statusCode).json(output);
					});
				}
			});
		}
	});

	app.post('/api/test', (req, res) => {
		/*
		*	endpoint for testing of requests proxied to third pary APIs
		*/
		console.log('\n', ' >> TEST ENDPOINT CALL', '\n');
		console.log(' > req.headers:', req.headers);
		console.log(' > req.query:', req.query);
		console.log(' > req.body:', req.body);
		res.status(200).json({message: 'test finished'});
	});
};
