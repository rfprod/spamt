'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

let Query = new Schema({
	name:				String,	// user input
	weight:			Number,	// generated
	timestamp:	Number	// generated
});

module.exports = mongoose.model('Query', Query);
