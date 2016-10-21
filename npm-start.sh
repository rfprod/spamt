if [[ -n $OPENSHIFT_DATA_DIR ]]; then
  echo "openshift env, data dir: $OPENSHIFT_DATA_DIR"
  node server.js
else
  echo "development env"
  gulp
fi
