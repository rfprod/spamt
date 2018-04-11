function getCacheName() {
	return new Promise(function(resolve) {
		fetch(self.registration.scope + 'api/app-diag/hashsum').then(async function(response) {
			var json = await response.json();
			resolve('spamt-' + json.hashsum);
		}).catch(function() {
			resolve('NA-' + new Date().getTime());
		});
	});
}
var cacheName;

var staticAssets = [
	'/public/webfonts/fa-brands-400.svg',
	'/public/webfonts/fa-brands-400.ttf',
	'/public/webfonts/fa-brands-400.eot',
	'/public/webfonts/fa-brands-400.woff',
	'/public/webfonts/fa-brands-400.woff2',
	'/public/webfonts/fa-regular-400.svg',
	'/public/webfonts/fa-regular-400.ttf',
	'/public/webfonts/fa-regular-400.eot',
	'/public/webfonts/fa-regular-400.woff',
	'/public/webfonts/fa-regular-400.woff2',
	'/public/webfonts/fa-solid-900.svg',
	'/public/webfonts/fa-solid-900.ttf',
	'/public/webfonts/fa-solid-900.eot',
	'/public/webfonts/fa-solid-900.woff',
	'/public/webfonts/fa-solid-900.woff2',
	'/public/webfonts/MaterialIcons-Regular.ttf',
	'/public/webfonts/MaterialIcons-Regular.eot',
	'/public/webfonts/MaterialIcons-Regular.woff',
	'/public/webfonts/MaterialIcons-Regular.woff2',
	'/public/img/Angular_logo.svg',
	'/public/img/MongoDB_logo.svg',
	'/public/img/Node.js_logo.svg',
	'/public/img/SoundCloud_logo.svg',
	'/public/img/Twitter_bird_logo_2012.svg'
];

self.addEventListener('install', function(event) {
	console.log('>> serviceWorker, install event', event);
	/*
	*	use caching then force activation
	*/
	event.waitUntil(
		getCacheName().then(function(gotCacheName) {
			cacheName = gotCacheName;
			console.log('cacheName', cacheName);
			caches.open(cacheName).then(function(cache) {
				return cache.addAll(staticAssets).then(function() {
					console.log('>> serviceWorker, cached static assets');
					self.skipWaiting();
				});
			});
		})
	);
});

self.addEventListener('activate', function(event) {
	console.log('>> serviceWorker, activated event', event);
	event.waitUntil(
		caches.keys().then(function(keys) {
			console.log('caches keys', keys);
			keys.forEach(function(cacheKey) {
				if (cacheKey !== cacheName) {
					caches.delete(cacheKey);
				}
			});
		})
	);
});

function updateCache() {
	return new Promise(function(resolve) {
		getCacheName().then(function(gotCacheName) {
			console.log('updateCache, compare build hashes');
			if (cacheName !== gotCacheName) {
				cacheName = gotCacheName;
				console.log('updateCache, updating cache, cacheName', cacheName);
				caches.keys().then(function(keys) {
					keys.forEach(function(cacheKey) {
						if (cacheKey !== cacheName) {
							caches.delete(cacheKey);
						}
					});
				}).then(function() {
					caches.open(cacheName).then(function(cache) {
						cache.addAll(staticAssets).then(function() {
							console.log('>> serviceWorker, updated cached static assets');
							resolve();
						});
					});
				});
			} else {
				console.log('updateCache. not need to do that, build hashes are the same');
				resolve();
			}
		});
	});
}

self.addEventListener('fetch', function(event) {
	console.log('>> serviceWorker, fetch event', event);
	var request = event.request;
	if (/service-worker\.js$/.test(request.url)) {
		console.log('>> serviceWorker, should check cache update, this happens on initial page load when worker is already installed');
		event.waitUntil(updateCache());
		event.respondWith(fetch(request));
	} else {
		event.respondWith(caches.open(cacheName).then(function(cache) {
			return cache.match(request).then(function(response) {
				if (response) {
					console.log('>> serviceWorker returns cached respose on request', request);
					return response;
				} else {
					return fetch(request);
				}
			}).catch(function(error) {
				return error;
			});
		}));
	}
});
