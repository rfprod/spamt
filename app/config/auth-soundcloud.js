'use strict';

module.exports = {
	'soundcloudAuth': {
		'clientID': process.env.SOUNDCLOUD_CLIENT_ID,
		'clientSecret': process.env.SOUNDCLOUD_SECRET,
		'callbackURL': process.env.APP_URL + 'api/auth/soundcloud/callback'
	}
};
