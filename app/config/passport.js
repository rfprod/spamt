'use strict';

var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../models/users');
var configAuthTwitter = require('./auth-twitter');
var crypto = require('crypto');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
	passport.use(new TwitterStrategy({
	    consumerKey: configAuthTwitter.twitterAuth.clientID,
	    consumerSecret: configAuthTwitter.twitterAuth.clientSecret,
	    callbackURL: configAuthTwitter.twitterAuth.callbackURL
	},function(token, tokenSecret, profile, done) {
		console.log('passport profile');
		console.log(profile);
	    process.nextTick(function () {
			User.findOne({ 'twitter.id': profile.id }, function (err, user) {
				if (err) return done(err);
				if (user) return done(null, user);
				else {
					var newUser = new User();
						newUser.twitter.id = profile.id;
						newUser.twitter.username = profile.username;
						newUser.twitter.displayName = profile.displayName;
						newUser.nbrClicks.clicks = 0;
						newUser.save(function (err) {
							if (err) throw err;
							return done(err, newUser);
						});
				}
			});
		});
	  }
	));
	
	function generateDerivate(password, storedSalt){
		var salt, derivate, obj;
		
		if (storedSalt) salt = storedSalt;
		else salt = crypto.randomBytes(24).toString('hex');
		
		derivate = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
		obj = { derivate: derivate, salt: salt };
		console.log(obj);
		return obj;
	}
	passport.use(new LocalStrategy({
	    usernameField: 'emailLogin',
	    passwordField: 'passwordLogin',
	    passReqToCallback: true
	},function (req, username, password, done) {
		process.nextTick(function () {
			User.findOne({ 'userExtended.email': username }, function (err, user) {
				if (err) return done(err);
				if (!user) return done(null, false, {message: 'Unknown user'});
				if (user.userExtended.salt) {
					var derivateObj = generateDerivate(password, user.userExtended.salt);
					if (user.userExtended.pass != derivateObj.derivate) return done(null, false, {message: 'Wrong password'});
				}else if (user.userExtended.pass != password) return done(null, false, {message: 'Wrong password'});
				return done(null, user);
			});
		});
	}));
};
