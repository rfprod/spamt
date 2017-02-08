'use strict';

var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var SoundcloudStrategy = require('passport-soundcloud').Strategy;
var BearerStrategy = require('passport-http-api-token-bearer').Strategy;
var User = require('../models/users');
var configAuthTwitter = require('./auth-twitter');
var configAuthSoundcloud = require('./auth-soundcloud');
var crypto = require('crypto');

module.exports = function(passport) {
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});
	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});

	passport.use(new BearerStrategy({
		access_token: 'user_token'
	}, (token, done) => {
		process.nextTick(() => {
			User.findOne({'userExtended.jwToken': token}, (err, user) => {
				if (err) return done(err);
				if (!user) return done(null, false, {statusCode: 401, error: true, message: 'Unknown user'});
				return done(null, user, {statusCode: 200, scope: 'all'});
			});
		});
	}));

	passport.use(new TwitterStrategy({
		consumerKey: configAuthTwitter.twitterAuth.clientID,
		consumerSecret: configAuthTwitter.twitterAuth.clientSecret,
		callbackURL: configAuthTwitter.twitterAuth.callbackURL
	}, (token, tokenSecret, profile, done) => {
		console.log('twitter passport profile:', profile);
		process.nextTick(() => {
			User.findOne({ 'twitter.id': profile.id }, (err, user) => {
				if (err) return done(err);
				if (user) return done(null, user);
				else {
					var newUser = new User();
					newUser.twitter.id = profile.id;
					newUser.twitter.username = profile.username;
					newUser.twitter.displayName = profile.displayName;
					newUser.save(err => {
						if (err) throw err;
						return done(err, newUser);
					});
				}
			});
		});
	}));

	passport.use(new SoundcloudStrategy({
		clientID: configAuthSoundcloud.soundcloudAuth.clientID,
		clientSecret: configAuthSoundcloud.soundcloudAuth.clientSecret,
		callbackURL: configAuthSoundcloud.soundcloudAuth.callbackURL
	}, (token, tokenSecret, profile, done) => {
		console.log('soundcloud passport profile', profile);
		process.nextTick(() => {
			User.findOne({ 'soundcloud.id': profile.id }, (err, user) => {
				if (err) return done(err);
				if (user) return done(null, user);
				else {
					var newUser = new User();
					newUser.soundcloud.id = profile.id;
					newUser.soundcloud.username = profile.username;
					newUser.soundcloud.displayName = profile.displayName;
					newUser.save(err => {
						if (err) throw err;
						return done(err, newUser);
					});
				}
			});
		});
	}));

	function generateDerivate(password, storedSalt) {
		var salt, derivate, obj;
		
		if (storedSalt) salt = storedSalt;
		else salt = crypto.randomBytes(24).toString('hex');
		
		derivate = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
		obj = { derivate: derivate, salt: salt };
		//console.log(obj);
		return obj;
	}
	passport.use(new LocalStrategy({
		usernameField: 'emailLogin',
		passwordField: 'passwordLogin',
		passReqToCallback: true
	}, (req, username, password, done) => {
		process.nextTick(() => {
			User.findOne({ 'userExtended.email': username }, (err, user) => {
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
