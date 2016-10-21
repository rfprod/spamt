'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

let User = new Schema({
	id:								String,	// generated
	role:							String,	// generated
	registered:				String,	// generated
	lastLogin:				String,	// generated
	userExtended: {
		email:					String,	// user input
		salt:						String,	// generated
		pass:						String,	// generated
		passResetToken:	String,	// generated
		fullName:				String,	// user input
		city:						String,	// user input
		country:				String	// user input
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
