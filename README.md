# SPAMT

![build](https://travis-ci.org/rfprod/spamt.svg?branch=master)

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

## Requirements

In order to run your own copy of SPAMT, you must have the following installed:

- [`Node.js`](https://nodejs.org/)
- [`NPM`](https://nodejs.org/)
- [`MongoDB`](http://www.mongodb.org/)
- [`Git`](https://git-scm.com/)
- [`Heroku CLI`](https://devcenter.heroku.com/articles/heroku-cli)

## Installation & Startup

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
TWITTER_ACCESS_TOKEN=twitter-access-token-for-single-user-app-mode
TWITTER_TOKEN_SECRET=twitter-token-secret-for-single-user-app-mode
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

#### Google Mail API instructions

1. go to [https://console.developers.google.com/](https://console.developers.google.com/) and create a project
2. create clientId, provide `https://developers.google.com/oauthplayground` as a Redirect URL form value, download data as json or copy paste it, you'll need `Client ID` and `Client secret`
3. go to [https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground), open config (click cog icon, right top screen part), select `Access token location`: `Authorization header w/ Bearer prefix`, set use you own OAuth credentials flag and input your credentials from previous step, close config
4. `Step1` Select & authorize APIs: type your own `https://mail.google.com`
5. `Step2` Exchange authorization code for tokens: get a refresh token - use this token as a value for the MAILER_REFRESH_TOKEN `.env` var

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

### Heroku Deployment

create a project

```
heroku create
```

check `./Procfile` which should have the following contents

```
web: npm run heroku-start
```

add mongolab addon

```
heroku addons:add mongolab
```

get mongodb url and copy result

```
heroku config:get MONGODB_URI
```

set environment variables (all listed in under **Local Environment Variables** subheading above)

```
...
heroku config:set PORT=8080
...
```

edit local `.env` file manually, set Heroku mongo uri instead of local one

```
MONGODB_URI=value-got-previously-from-heroku
```

get Heroku deployment url, use the value when setting `APP_URL` environment variable later

```
heroku info
```

set environment variables (all listed in under **Local Environment Variables** subheading above)

```
...
heroku config:set PORT=8080
...
```

edit local `.env` file manually, set Heroku mongo uri instead of local one to make requests to database deployed on Heroku

```
MONGODB_URI=value-got-previously-from-heroku
```

build application and push to heroku

```
gulp compile-and-build
git push heroku master
```

or use a single command

```
npm run heroku-deploy
```

open on heroku

```
heroku open
```

#### Heroku deployment: START

to start the app (MongoDB, Node and establish MongoDB connection, Gulp watchers), execute in the terminal while in the project folder (dependencies installation check will be performed before)

```
heroku local
```

now open your browser and type in the address bar

```
http://localhost:8080/
```


### Testing

`HeadlessChrome` note: for client unit and e2e tests to work you should have an environment variable for headless Chrome exported (appended to `~/.bashrc`), its value should be set to one of the following options, depending on what you have installed: `chromium-browser, chromium, google-chrome`

```
export CHROME_BIN=chromium-browser
```

#### Server

To test the server execute the following command in the terminal window while in your project's folder when the server is running:

```
npm run server-test
```

#### Client Unit

To test the client execute the following command in the terminal window while in your project's folder:

for continuous testing

```
npm run client-test
```

for single test

```
npm run client-test-single-run
```

single run execution generates a coverage html-report from generated json data, reports location

  * `./logs`
    * `./logs/coverage` - json data
      * `./logs/coverage/html-report` - html-report generated from json data

#### Coverage report

to generate a coverage report for client code execute (should be preceeded by unit tests execution so that json data exists)

```
npm run client-coverage-report
```

previously generated coverage reports are cleared automatically before single run tests execution

to remove previously generated coverage reports manually use

```
npm run clear-reports
```

##### How to read a coverage report

* `Statements` - how much statements of the program module have beed executed
* `Branches` - how much branches of the control flow of the program module have been executed (if else statements)
* `Functions` - how much functions of the program module have beed executed
* `Lines` - how much executable lines in the source code have been executed

for more details see [`istanbul code coverage tool`](https://gotwarlost.github.io/istanbul)

To lint the code execute the following command in the terminal window while in your project's folder:

#### Code Linting

```
npm run lint
```

## Heroku Documentation

* [`Heroku Devcenter: Getting started with nodejs`](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
* [`Heroku Elements: Addons: Mongolab`](https://elements.heroku.com/addons/mongolab)

## Licenses

* [`SPAMT`](LICENSE)
