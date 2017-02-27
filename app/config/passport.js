'use strict';

var TwitterStrategy = require('passport-twitter').Strategy;
var SoundcloudStrategy = require('passport-soundcloud').Strategy;
var BearerStrategy = require('passport-http-api-token-bearer').Strategy;
var User = require('../models/users');
var configAuthTwitter = require('./auth-twitter');
var configAuthSoundcloud = require('./auth-soundcloud');

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
			User.findOne({'jwToken': token}, (err, user) => {
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

};
