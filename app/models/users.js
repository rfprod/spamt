'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

let User = new Schema({
	role:								String,	// gen
	salt:								String,	// gen
	jwToken:						String,	// gen
	registered:					String,	// gen
	lastLogin:					String,	// gen
	userExtended: {
		login:						String, // gen
		email:						String,	// input
		firstName:				String,	// input
		lastName:					String	// input
	},
	twitter: {					// sync
		id:								String,
		displayName:			String,
		username:					String,
		photo: 						String,
		location: 				String,
		description: 			String,
		url: 							String,
		lang: 						String,
		created_at: 			Number,
		geo_enabled: 			Boolean,
		verified: 				Boolean,
		followers_count: 	Number,
		friends_count: 		Number,
		listed_count: 		Number,
		favourites_count: Number,
		statuses_count: 	Number,
		status: {
			id: 						Number,
			created_at: 		Number,
			text: 					String,
			retweet_count: 	Number,
			favorite_count: Number,
			favorited: 			Boolean,
			retweeted: 			Boolean
		}
	},
	soundcloud: {				//sync
		id:								String,
		displayName:			String,
		username:					String
	}
});

module.exports = mongoose.model('User', User);
