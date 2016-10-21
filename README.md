# SPAMT

[SPAMT deployed on Openshift](http://spamt-ecapseman.rhcloud.com/)

## Overview

SPAMT stands for Social Profile Analysis and Management Tool.
It allows a user to analyse and manage owned profiles on integrated social networks.

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
$ git clone https://github.com/rfprod/whoami.git
```

This will install the WhiAmI microservice components into the `whoami` directory in your projects folder.

### Local Environment Variables

Create a file named `.env` in the root directory. This file should contain:

```
TWITTER_KEY=twitter-key
TWITTER_SECRET=twitter-secret
SOUNDCLOUD_KEY=soundcloud-key
SOUNDCLOUD_SECRET=soundcloud-secret
SOUNDCLOUD_CLIENT_ID=soundcloud-client-id
MONGO_URI=mongodb://localhost:27017/spamt
PORT=8080
APP_URL=http://localhost:8080/
```

#### Openshift deployment requires env variables setup via rhc

for example

`rhc env set -a smapt -e APP_URL=https://spamt-ecapseman.rhcloud.com/`

required vars

```
TWITTER_KEY=twitter-key
TWITTER_SECRET=twitter-secret
SOUNDCLOUD_KEY=soundcloud-key
SOUNDCLOUD_SECRET=soundcloud-secret
SOUNDCLOUD_CLIENT_ID=soundcloud-client-id
APP_URL=application-url
MONGO_USR=database-user-name
MONGO_PASS=database-user-password
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

To test the client execute the following command in the terminal window while in your project's folder (buggy in single run mode):

```
$ npm run client-test
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
