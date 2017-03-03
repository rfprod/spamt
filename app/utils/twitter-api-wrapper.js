'use strict';

/*
*	Twitter API wrapper
*/
class TWTR {
	constructor(thenReq, crypto) {
		this.apiUrl = 'https://api.twitter.com/';
		this.clientID = process.env.TWITTER_KEY;
		this.clientSecret = process.env.TWITTER_SECRET;
		this.accessToken = process.env.TWITTER_ACCESS_TOKEN;
		this.tokenSecret = process.env.TWITTER_TOKEN_SECRET;
		this.thenReq = thenReq; // synchronous request method - is provided as param
		this.crypto = crypto; // node crypto is used to generate random sequence for Twitter auth
		this.endpoints = {
			oauth: { // https://dev.twitter.com/oauth/reference
				get : {
					authenticate: 'oauth/authenticate',
					authorize: 'oauth/authorize'
				},
				post: {
					access_token: 'oauth/access_token',
					request_token: 'oauth/request_token',
					invalidate_token: 'oauth/invalidate_token',
					token: 'oauth/token' // application only authentication usign bearer token
				}
			},
			rest: { // https://dev.twitter.com/rest/reference
				version: '1.1/',
				application: {
					get: {
						rate_limit_status: 'application/rate_limit_status'
					}
				},
				account: {
					get: {
						settings: 'account/settings.json',
						verify_credentials: 'account/verify_credentials.json'
					},
					post: {
						remove_profile_banner: 'account/remove_profile_banner.json',
						settings: 'account/settings.json',
						update_profile: 'account/update_profile.json',
						update_profile_background_image: 'account/update_profile_background_image.json',
						update_profile_banner: 'account/update_profile_banner.json',
						update_profile_image: 'account/update_profile_image.json'
					}
				},
				blocks: {
					get: {
						ids: 'blocks/ids.json',
						list: 'blocks/list.json'
					},
					post: {
						create: 'blocks/create.json',
						destroy: 'blocks/destroy.json'
					}
				},
				collections: {
					get: {
						entries: 'collections/entries.json',
						list: 'collections/list.json',
						show: 'collections/show.json'
					},
					post: {
						create: 'collections/create.json',
						destroy: 'collections/destroy.json',
						entries_add: 'collections/entries/add.json',
						entries_curate: 'collections/entries/curate.json',
						entries_move: 'collections/entries/move.json',
						entries_remove: 'collections/entries/remove.json',
						update: 'collections/update.json'
					}
				},
				direct_messages: {
					get: {
						direct_messages: 'direct_messages.json',
						sent: 'direct_messages/sent.json',
						show: 'direct_messages/show.json'
					},
					post: {
						destroy: 'direct_messages/destroy.json',
						new: 'direct_messages/new.json'
					}
				},
				favorites: {
					get: {
						list: 'favorites/list.json'
					},
					post: {
						create: 'favorites/create.json',
						destroy: 'favorites/destroy.json'
					}
				},
				followers: {
					get: {
						ids: 'followers/ids.json',
						list: 'followers/list.json'
					}
				},
				friends: {
					get: {
						ids: 'friends/ids.json',
						list: 'friends/list.json'
					}
				},
				friendships: {
					get: {
						incoming: 'friendships/incoming.json',
						lookup: 'friendships/lookup.json',
						no_retweets_ids: 'friendships/no_retweets/ids.json',
						outgoing: 'friendships/outgoing.json',
						show: 'friendships/show.json'
					},
					post: {
						create: 'friendships/create.json',
						destroy: 'friendships/destroy.json',
						update: 'friendships/update.json'
					}
				},
				geo: {
					get: {
						id: 'geo/id/', // + :place_id.json
						reverse_geocode: 'geo/reverse_geocode.json',
						search: 'geo/search.json'
					},
					post: {
						place: 'geo/place.json'
					}
				},
				help: {
					get: {
						configuration: 'help/configuration.json',
						languages: 'help/languages.json',
						privacy: 'help/privacy.json',
						tos: 'help/tos.json'
					}
				},
				lists: {
					get: {
						list: 'lists/list.json',
						members: 'lists/members.json',
						members_show: 'lists/members/show.json',
						memberships: 'lists/memberships.json',
						ownerships: 'lists/ownerships.json',
						show: 'lists/show.json',
						statuses: 'lists/statuses.json',
						subscribers: 'lists/subscribers.json',
						subscribers_show: 'lists/subscribers/show.json',
						subscriptions: 'lists/subscriptions.json'
					},
					post: {
						create: 'lists/create.json',
						destroy: 'lists/destroy.json',
						members_create: 'lists/members/create.json',
						members_create_all: 'lists/members/create_all.json',
						members_destroy: 'lists/members/destroy.json',
						members_destroy_all: 'lists/members/destroy_all.json',
						subscribers_create: 'lists/subscribers/create.json',
						subscribers_destroy: 'lists/subscribers/destroy.json',
						update: 'lists/update.json'
					}
				},
				media: {
					get: {
						upload_status: 'media/upload.json?command=status',
					},
					post: {
						metadata_create: 'media/metadata/create.json',
						upload_append: 'media/upload.json?command=append',
						upload_finalize: 'media/upload.json?command=finalize',
						upload_init: 'media/upload.json?command=init'
					}
				},
				mutes: {
					get: {
						users_ids: 'mutes/users/ids.json',
						users_list: 'mutes/users/list.json'
					},
					post: {
						users_create: 'mutes/users/create.json',
						users_destroy: 'mutes/users/destroy.json'
					}
				},
				saved_searches: {
					get: {
						list: 'saved_searches/list.json',
						id: 'saved_searches/show/' // + :id.json
					},
					post: {
						create: 'saved_searches/create.json',
						destroy: 'saved_searches/destroy/' // + :id.json
					}
				},
				search: {
					get: {
						tweets: 'search/tweets.json'
					}
				},
				statuses: {
					get: {
						home_timeline: 'statuses/home_timeline.json',
						lookup: 'statuses/lookup.json',
						mentions_timeline: 'statuses/mentions_timeline.json',
						oembed: 'statuses/oembed.json',
						retweeters_ids: 'statuses/retweeters/ids.json',
						retweets: 'statuses/retweets/', // + :id.json
						retweets_of_me: 'statuses/retweets_of_me.json',
						show: 'statuses/show/', // + :id.json
						user_timeline: 'statuses/user_timeline'
					},
					post: {
						destroy: 'statuses/destroy/', // + :id.json
						retweet: 'statuses/retweet/', // + :id.json
						unretweet: 'statuses/unretweet/', // + :id.json
						update: 'statuses/update'
					}
				},
				trends: {
					get: {
						available: 'trends/available.json',
						closest: 'trends/closest.json',
						place: 'trends/place.json'
					}
				},
				users: {
					get: {
						lookup: 'users/lookup.json',
						profile_banner: 'users/profile_banner.json',
						search: 'users/search.json',
						show: 'users/show.json',
						suggestions_categories: 'users/suggestions.json',
						suggestions_cat_users: 'users/suggestions/', // + :slug.json // :slug is category name retrieved from 'suggestions_categories' endpoint
						suggestins_cat_users_statuses: 'users/suggestions/' // + :slug/members.json
					},
					post: {
						report_spam: 'users/report_spam.json'
					}
				}
			}
		};
	}

	generateNonce() {
		return this.crypto.randomBytes(32).toString('base64').replace(/[^a-z0-9]/gi, '');
	}

	request(method, endpoint, oauth_token, oauth_secret, query_obj = {}) {
		/**
		* example arguments
		* method: GET (default) / POST
		* endpoint: 'this.endpoints.rest.application.get.rate_limit_status'
		*	endpoint resolves to '1.1/application/rate_limit_status'
		*	oauth_token: <...> may be null
		*	oauth_secret: <...> may be null
		* query_obj: { param_1:'value1', 'param-2':'value2' }
		*/
		if (!method && !endpoint) { return { statusCode: 404, error: 'no endpoint specified' }; }
		/*
		* Check if its single user access mode
		*	when the app uses own access token to sign in instead of using one provided by user
		*
		*	this mode is active if request method is called with oauth_token and oauth_secret when both equal null
		*/
		if (oauth_token === null && oauth_secret === null) {
			oauth_token = this.accessToken;
			oauth_secret = this.tokenSecret;
		}
	/*
	*	collect parameters for request authorization
	*/
		let url = (endpoint.indexOf('oauth') !== -1) ? this.apiUrl + endpoint : this.apiUrl + this.endpoints.rest.version + endpoint;
		let authParam = {
			oauth_consumer_key: this.clientID,
			oauth_nonce: this.generateNonce(),
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: new Date().getTime() / 1000,
			oauth_token: oauth_token,
			oauth_version: '1.0'
		};
		/*
		*	process query parameters (json)
		*/
		if (query_obj.qc) {
			for (let key in query_obj.qc) {
				/*
				*	copy query parameters to authParam
				*	if authParam contains key same as query param key, it is not overwritten
				*/
				authParam[key] = (!authParam[key]) ? query_obj.qc[key] : authParam[key];
			}
		}
		/*
		*	process body parameters (string)
		*/
		const bodyParams = (query_obj.body) ? query_obj.body.split('&').filter(item => item).map(item => item.split('=')) : '';
		console.log('bodyParams:', bodyParams);
		for (let p of bodyParams) {
			/*
			*	copy body parameters to authParam
			*	if authParam contains key same as body param key, it is not overwritten
			*/
			authParam[p[0]] = (!authParam[p[0]]) ? p[1] : authParam[p[0]];
		}
		console.log('authParam:', authParam);

	/*
	*	Twitter oauth signature generation
	*	https://dev.twitter.com/oauth/overview/creating-signatures
	*
	*	encode parameter string generation
	*	1. Percent encode every key and value that will be matchUnsigned
	* 2. Sort the list of params alphabetically
	*	3. For each key/value pair:
	*	3.1 append the encoded key to the output
	*	3.2 append '=' to the output
	*	3.3 append the encoded value to the output
	*	3.4 separate key/value pairs with '&'
	*/
		let params = [];
		// 1
		for (let key in authParam) {
			params.push([ encodeURIComponent(key), encodeURIComponent(authParam[key]) ]);
		}
		// 2
		params.sort((a, b) => {
			if (a[0] < b[0]) { return -1; }
			if (a[0] > b[0]) { return 1; }
			return 0;
		});
		console.log('params:', params, '\n');
		// 3
		let parameterString = '';
		for (let param of params) {
			parameterString += param[0] + '=' + param[1] + '&';
		}
		parameterString = parameterString.substring(0, parameterString.length - 1);
		console.log('parameterString:', parameterString, '\n');
	/*
	*	create signature base string
	*	1. add method name in uppercase to output string
	*	2. add '&' to output string
	*	3. percent encode and add url to output string
	* 4. add '&' to output string
	* 5. percent encode and add parameterString to output string
	*
	*	resulting string should contain only two '&'
	*/
		const signatureBaseString = method.toUpperCase() + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(parameterString);
		console.log('signatureBaseString:', signatureBaseString, '\n');
	/*
	*	create signing key
	*	1. add percent encoded Twitter App Client Secret to output string
	*	2. add '&' to output string
	*	3. add percent encoded User oAuth Secret to output string
	*
	*	to make request on behalf of the application
	*	oauth_secret should be set equal to process.env.TWITTER_TOKEN_SECRET on request method call
	*/
		const signingKey = encodeURIComponent(this.clientSecret) + '&' + encodeURIComponent(oauth_secret);
		console.log('signingKey:', signingKey, '\n');
	/*
	*	generate HMAC-SHA1 oauth signature string
	*/
		const oauthSignature = this.crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
		console.log('oauthSignature:', oauthSignature, '\n');
	/*
	*	Building the request string
	*	1. Append 'OAuth' to output
	* 2. percent encode key and append to output
	*	3. append '=' to output
	*	4. append '"' to output
	*	5. percent encode value and append to output
	*	6. append '"' to output
	*	7. add more key/value pairs separating each pair with comma and space ', '
	*/
		let options = {
			'headers': {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'OAuth ' +
					'oauth_consumer_key="' + encodeURIComponent(authParam.oauth_consumer_key) + '", ' +
					'oauth_nonce="' + encodeURIComponent(authParam.oauth_nonce) + '", ' +
					'oauth_signature="' + encodeURIComponent(oauthSignature) + '", ' +
					'oauth_signature_method="' + encodeURIComponent(authParam.oauth_signature_method) + '", ' +
					'oauth_timestamp="' + encodeURIComponent(authParam.oauth_timestamp) + '", ' +
					'oauth_token="' + encodeURIComponent(authParam.oauth_token) + '", ' +
					'oauth_version="' + encodeURIComponent(authParam.oauth_version) + '"'
			}
		};
		if (query_obj.qc) {
			/*
			*	options.qc is considered by thenRequest only for GET requests, type - object
			*/
			options.qc = query_obj.qc;
			/*
			*	append query parameters to url if method is not GET
			*/
			if (method !== 'GET') {
				for (let key in query_obj.qc) {
					url += (url.indexOf('?') === -1) ? '?' : '&';
					url += key + '=' + query_obj.qc[key];
				}
			}
		}
		if (query_obj.body) { options.body = query_obj.body; } // will be considered by thenRequest only for POST, PUT, PATCH requests, type - buffer or string
		if (query_obj.json) { options.json = query_obj.json; } // sets header Content-Type to application/json and sends data as json; probaby possible for all requests, no info in docs
		/*
		* DEBUG mode
		*	uncomment next line to route requests to local testing endpoint instread of Twitter servers
		*	this may be useful when making sure requests are sent correctly
		*/
		// url = 'http://localhost:8080/test?include_entities=true';
		console.log(' >> method:', method, '\n >> url:', url, '\n >> options:', options, '\n');
		return this.thenReq(method, url, options);
	}
}

module.exports = TWTR;
