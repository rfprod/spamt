if [[ -n $OPENSHIFT_DATA_DIR ]]; then
  echo "openshift env, data dir: $OPENSHIFT_DATA_DIR"
  node server.js
  #npm run production-start #custom production env
else
  echo "development env"
  npm run development-start
fi
