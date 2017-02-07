For information about markers, consult the documentation:

https://developers.openshift.com/languages/nodejs/markers.html

Marker File 			Effect

force_clean_build		Will remove all previous dependencies and start installing required dependencies from scratch.

use_npm 				Initialize your application or service using npm start instead of supervisor servername.js
						(where servername.js is based on the value of your package.json’s `main attribute).

NODEJS_VERSION 			File with a version number will force that specific version to be run. E.g.: for running Node
						version 0.9.1, simply put 0.9.1 into this marker file.

hot_deploy 				Push code updates without waiting for a full application restart. This feature is not available
						when the use_npm marker is enabled.

disable_auto_scaling 	Will prevent scalable applications from scaling up or down, according to application load.
