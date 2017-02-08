//const User = require('../models/users');
//const jwt = require('jwt-simple');

module.exports = function(crypto, jwt, User) {
	return {
		/*
		* JWT methods
		*/
		renewPeriod: function() {
			return 518400000; // every 24 hours | 604750000 - almost immediately
		},
		generateJWToken: function(payload, storedSalt) {
			let salt, token;
			if (storedSalt) salt = storedSalt;
			else salt = crypto.randomBytes(24).toString('hex');
			token = jwt.encode(payload, salt, 'HS256'); // HS256, HS384, HS512, RS256.
			return { token: token, salt: salt };
		},
		decryptJWToken: function(token, storedSalt) {
			if (!token || !storedSalt) return false;
			return jwt.decode(token, storedSalt, 'HS256'); // HS256, HS384, HS512, RS256.
		},
		checkJWTokenExpiration: function(token, callback) {
			User.find({'jwToken': token}, (err,docs) => {
				if (err) throw err;
				let tokenStatus = { expired: false, renew: false },
					currentTime = new Date().getTime();
				if (docs.length > 0) {
					let storedSalt = docs[0].salt;
					let payload = this.decryptJWToken(token, storedSalt);
					console.log(payload);
					console.log(payload.expires, currentTime, payload.expires - currentTime);
					if (parseInt(payload.expires,10) <= currentTime) tokenStatus.expired = true;
					else if ((parseInt(payload.expires,10) - currentTime) <= this.renewPeriod()) tokenStatus.renew = true;
					else console.log('token status: ok');
				}
				if (callback) callback(tokenStatus);
			});
		},
		updateAccountLastLogin: function(jwToken) { // last login is updated every time a user account get jwToken update
			if (jwToken) {
				User.update({jwToken:jwToken}, {$set: {'lastLogin': new Date().getTime()}}, (err, doc) => {
					if (err) throw err;
					console.log('updated last log in:', JSON.stringify(doc));
				});
			} else return false;
		},
		setUserJWToken: function (id, tokenObj, callback) {
			User.update({_id: id}, {$set:{'jwToken':tokenObj.token,'salt':tokenObj.salt}}, (err,dt) => {
				if (err) throw err;
				console.log('set user jwToken:', JSON.stringify(dt));
				this.updateAccountLastLogin(tokenObj.token);
				if (callback) { callback(); }
			});
		},
		updateUserJWToken: function (currentToken, newTokenObj) {
			User.update({'jwToken': currentToken}, {$set:{'jwToken':newTokenObj.token,'salt':newTokenObj.salt}}, (err,dt) => {
				if (err) throw err;
				console.log('update user jwToken:', JSON.stringify(dt));
				this.updateAccountLastLogin(newTokenObj.token);
			});
		},
		resetUserJWToken: function (id, token, callback) {
			if (id) {
				User.update({_id: id}, {$set:{'jwToken':'','salt':''}}, (err,dt) => {
					if (err) throw err;
					console.log('reset user jwToken:', JSON.stringify(dt));
					if (callback) { callback(); }
				});
			} else if (token) {
				User.update({'jwToken': token}, {$set:{'jwToken':'','salt':''}}, (err,dt) => {
					if (err) throw err;
					console.log('reset user jwToken:', JSON.stringify(dt));
					if (callback) { callback(); }
				});
			} else {
				if (callback) { callback({error: 'Missing mandatory params \'id\' and/or \'token\''}); }
			}
		},
		renewUserToken: function (req, callback) {
			let userToken = req.query.user_token; // get toke from url var
			if (typeof userToken == 'undefined') userToken = req.body.user_token; // get token from request body
			let storedSalt = null,
				expirationDate = new Date();
			console.log('current userToken: ', userToken);
			User.find({'jwToken': userToken}, (err, docs) => {
				if (err) throw err;
				let user = docs[0];
				if (user.salt != '') storedSalt = user.salt;
				expirationDate.setDate(expirationDate.getDate() + 7);
				let payload = {
					id: user._id,
					login: user.userExtended.login,
					email: user.userExtended.email,
					role: user.role,
					expires: expirationDate.getTime() // expires in one week
				};
				let tokenObj = this.generateJWToken(payload, storedSalt);
				if (callback) { callback(tokenObj); }
			});
		},
		reportRenewedTokenToUser: function (req,res) {
			let userToken = req.query.user_token; // get toke from url var
			if (typeof userToken == 'undefined') userToken = req.body.user_token; // get token from request body
			//console.log('current user token: '+userToken);
			if (req.renewedTokenObj) { // set header if user token has been renewed - this token should be used for subsequent request
				res.header('userTokenUpdate', req.renewedTokenObj.token);
				//console.log(req.renewedTokenObj);
				this.updateUserJWToken(userToken, req.renewedTokenObj);
			}
		}
	};
};
