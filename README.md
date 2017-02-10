# SPAMT

[SPAMT deployed on Openshift](http://spamt-ecapseman.rhcloud.com/)

## Overview

SPAMT stands for Social Profile Analysis and Management Tool.

### User Stories
* User can see brief information about the application - `/intro` view
* User can analyse any Soundcloud profile by providing a soundcloud username - `/data` view
* User can see must popular queries as clickable buttons while on the `/data` view by default when nothing is selected
* While analysing a Soundcloud profile, user can:
  * see public profile data: user, tracks, playlists, favorites, followers, followings
  * listen to profile tracks
  * filter profile tracks, playlists, favorites, followers, followings

### Integrations

* [`Soundcloud`](https://soundcloud.com/)
* [`Twitter`](https://twitter.com/)

# Start

### Requirements

In order to run your own copy of SPAMT, you must have the following installed:

- [`Node.js`](https://nodejs.org/)
- [`NPM`](https://nodejs.org/)
- [`MongoDB`](http://www.mongodb.org/)
- [`Git`](https://git-scm.com/)

### Installation & Startup

To install SPAMT execute the below command in the terminal window while in your projects folder:

```
git clone https://github.com/rfprod/spamt.git
```

This will install the SPAMT components into the `spamt` directory in your projects folder.

### Local Environment Variables

Create a file named `.env` in the root directory. This file should contain:

```
TWITTER_KEY=twitter-key
TWITTER_SECRET=twitter-secret
SOUNDCLOUD_SECRET=soundcloud-secret
SOUNDCLOUD_CLIENT_ID=soundcloud-client-id
MONGO_URI=mongodb://localhost:27017/spamt
PORT=8080
APP_URL=http://localhost:8080/
MAILER_HOST=smtp.gmail.com
MAILER_PORT=465
MAILER_EMAIL=dummy-sender-email@gmail.com
MAILER_CLIENT_ID=dummy-client-id.apps.googleusercontent.com
MAILER_CLIENT_SECRET=dummy-client-secret
MAILER_REFRESH_TOKEN=dummy-refresh-token
MAILER_RECIPIENT_EMAIL=dummy-recipient-email@gmail.com
```

##### Google Mail API instructions

1. go to [https://console.developers.google.com/](https://console.developers.google.com/) and create a project
2. create clientId, provide `https://developers.google.com/oauthplayground` as a Redirect URL form value, download data as json or copy paste it, you'll need `Client ID` and `Client secret`
3. go to [https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground), open config (click cog icon, right top screen part), select `Access token location`: `Authorization header w/ Bearer prefix`, set use you own OAuth credentials flag and input your credentials from previous step, close config
4. `Step1` Select & authorize APIs: type your own `https://mail.google.com`
5. `Step2` Exchange authorization code for tokens: get a refresh token - use this token as a value for the MAILER_REFRESH_TOKEN `.env` var

#### Openshift deployment requires env variables setup via rhc

for example

`rhc env set -a smapt -e APP_URL=https://spamt-ecapseman.rhcloud.com/`

required vars

```
TWITTER_KEY=twitter-key
TWITTER_SECRET=twitter-secret
SOUNDCLOUD_SECRET=soundcloud-secret
SOUNDCLOUD_CLIENT_ID=soundcloud-client-id
APP_URL=application-url
MONGO_USR=database-user-name
MONGO_PASS=database-user-password
MAILER_HOST=smtp.gmail.com
MAILER_PORT=465
MAILER_EMAIL=dummy-sender-email@gmail.com
MAILER_CLIENT_ID=dummy-client-id.apps.googleusercontent.com
MAILER_CLIENT_SECRET=dummy-client-secret
MAILER_REFRESH_TOKEN=dummy-refresh-token
MAILER_RECIPIENT_EMAIL=dummy-recipient-email@gmail.com
```

### Starting the App

To start the app, execute in the terminal while in the project folder (dependencies installation check will be performed before)

```
npm start
```

Now open your browser and type in the address bar

```
http://localhost:8080/
```

SPAMT is up and running.

### Testing

To test the server execute the following command in the terminal window while in your project's folder when the server is running:

```
$ npm run server-test
```

To test the client execute the following command in the terminal window while in your project's folder:

for continuous testing

```
$ npm run client-test
```

for single test

```
$ npm run client-test-single-run
```

To lint the code execute the following command in the terminal window while in your project's folder:

```
$ npm run lint
```

### The OpenShift cartridges documentation

* [`cartridge guide`](https://github.com/openshift/origin-server/blob/master/documentation/oo_cartridge_guide.adoc#openshift-origin-cartridge-guide)
* [`cartridge guide: mongodb`](https://github.com/openshift/origin-server/blob/master/documentation/oo_cartridge_guide.adoc#9-mongodb)
* [`cartridge guide: nodejs`](https://github.com/openshift/origin-server/blob/master/documentation/oo_cartridge_guide.adoc#11-nodejs)

## Licenses

* [`SPAMT`](LICENSE.md)
