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
				if (err) { return done(err); }
				if (user) {
					User.update(
						{ 'twitter.id': profile.id },
						{ $set: {
								'twitter.username': profile.username,
								'twitter.displayName': profile.displayName,
								'twitter.photo': profile.photos[0].value,
								'twitter.location': profile._json.location,
								'twitter.description': profile._json.description,
								'twitter.url': profile._json.url,
								'twitter.lang': profile._json.lang,
								'twitter.created_at': new Date(profile._json.created_at).getTime(),
								'twitter.geo_enabled': profile._json.geo_enabled,
								'twitter.verified': profile._json.verified,
								'twitter.followers_count': profile._json.followers_count,
								'twitter.friends_count': profile._json.friends_count,
								'twitter.listed_count': profile._json.listed_count,
								'twitter.favourites_count': profile._json.favourites_count,
								'twitter.statuses_count': profile._json.statuses_count,
								'twitter.status.id': profile._json.status.id,
								'twitter.status.created_at': new Date(profile._json.status.created_at).getTime(),
								'twitter.status.text': profile._json.status.text,
								'twitter.status.retweeted': profile._json.status.retweeted,
								'twitter.status.favorited': profile._json.status.favorited,
								'twitter.status.retweet_count': profile._json.status.retweet_count,
								'twitter.status.favorite_count': profile._json.status.favorite_count
							}
						},
						(err, data) => {
							if (err) { throw err; }
							console.log('updated existing twitter user:', JSON.stringify(data));
							return done(null, user);
						}
					);
					//return done(null, user);
				} else {
					var newUser = new User();
					newUser.twitter.id = profile.id;
					newUser.twitter.username = profile.username;
					newUser.twitter.displayName = profile.displayName;
					newUser.twitter.photo = profile.photos[0].value;
					newUser.twitter.location = profile._json.location;
					newUser.twitter.description = profile._json.description;
					newUser.twitter.url = profile._json.url;
					newUser.twitter.lang = profile._json.lang;
					newUser.twitter.created_at = new Date(profile._json.created_at).getTime();
					newUser.twitter.geo_enabled = profile._json.geo_enabled;
					newUser.twitter.verified = profile._json.verified;
					newUser.twitter.followers_count = profile._json.followers_count;
					newUser.twitter.friends_count = profile._json.friends_count;
					newUser.twitter.listed_count = profile._json.listed_count;
					newUser.twitter.favourites_count = profile._json.favourites_count;
					newUser.twitter.statuses_count = profile._json.statuses_count;
					newUser.twitter.status.id = profile._json.status.id;
					newUser.twitter.status.created_at = new Date(profile._json.status.created_at).getTime();
					newUser.twitter.status.text = profile._json.status.text;
					newUser.twitter.status.retweeted = profile._json.status.retweeted;
					newUser.twitter.status.favorited = profile._json.status.favorited;
					newUser.twitter.status.retweet_count = profile._json.status.retweet_count;
					newUser.twitter.status.favorite_count = profile._json.status.favorite_count;
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
