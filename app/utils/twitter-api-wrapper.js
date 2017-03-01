'use strict';

/*
*	Twitter API wrapper
*/
class TWTR {
	constructor(thenReq) {
		this.apiUrl = 'https://api.twitter.com/';
		this.clientID = process.env.TWITTER_KEY;
		this.clientSecret = process.env.TWITTER_SECRET;
		this.thenReq = thenReq; // synchronous request method - is provided as param
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

	request(method = 'GET', endpoint, options) {
		/**
		* example arguments
		* method: GET (default) / POST
		* endpoint: 'this.endpoints.rest.application.get.rate_limit_status' should resolve to '1.1/application/rate_limit_status'
		*/
		if (!method && !endpoint) { return { statusCode: 401, error: 'no endpoint specified' }; }
		const url = (endpoint.indexOf('oauth') !== -1) ? this.apiUrl + endpoint : this.apiUrl + this.endpoints.rest.version + endpoint;
		return (options) ? this.thenReq(method, url, options) : this.thenReq(method, url);
	}
}

module.exports = TWTR;
