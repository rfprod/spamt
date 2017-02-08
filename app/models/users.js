'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

let User = new Schema({
	role:							String,	// gen
	salt:							String,	// gen
	jwToken:					String,	// gen
	registered:				String,	// gen
	lastLogin:				String,	// gen
	userExtended: {
		login:					String, // gen
		email:					String,	// input
		firstName:			String,	// input
		lastName:			String,	// input
		city:						String,	// input
		country:				String	// input
	},
	twitter: {
		id:							String,	// sync
		displayName:		String,	// sync
		username:				String	// sync
	},
	soundcloud: {
		id:							String,	// sync
		displayName:		String,	// sync
		username:				String	// sync
	}
});

module.exports = mongoose.model('User', User);
