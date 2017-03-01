'use strict';

/*
*	Soundcloud API wrapper
*/
class SC {
	constructor(thenReq) {
		this.apiUrl = 'https://api.soundcloud.com/';
		this.regExp = {
			userDetails: /http(s)?\:\/\/api\.soundcloud\.com\/users\/[0-9]+\/(tracks|playlists|favorites|followers|followings)/,
			userTrackDownload: /http(s)?\:\/\/api\.soundcloud\.com\/tracks\/[0-9]+\/download/,
			userTrackStream: /http(s)?\:\/\/api\.soundcloud\.com\/tracks\/[0-9]+\/stream/
		};
		this.endpoints = { resolve: 'resolve' };
		this.clientID = process.env.SOUNDCLOUD_CLIENT_ID;
		this.clientIDparam = 'client_id=' + this.clientID;
		this.thenReq = thenReq; // synchronous request method - is provided as param
	}

	resolve(path) {
		console.log('resolving path: ', path);
		const url = this.apiUrl + this.endpoints.resolve + '?url=' + path + '&' + this.clientIDparam;
		return this.thenReq('GET', url);
	}

	getURI(apiUri, options) {
		console.log('getting sc details by apiUri: ', apiUri);
		const url = apiUri + '?' + this.clientIDparam;
		return (options) ? this.thenReq('GET', url, options) : this.thenReq('GET', url);
	}
}

module.exports = SC;
