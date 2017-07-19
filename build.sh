if [[ -n $OPENSHIFT_DATA_DIR ]]; then
	echo "openshift env, data dir: $OPENSHIFT_DATA_DIR"
	HOME_TEMP=$HOME
export HOME=$OPENSHIFT_REPO_DIR
if [[ -f "${OPENSHIFT_REPO_DIR}"/gulpfile.js ]]; then
	cd "${OPENSHIFT_REPO_DIR}"
	tsc
	echo 'typescript compiled'
	gulp build
fi
export HOME=$HOME_TEMP
else
	echo "development env"
	gulp build
fi
