if [[ -n $OPENSHIFT_DATA_DIR ]]; then
	echo "openshift env, data dir: $OPENSHIFT_DATA_DIR"
	HOMEBACKUP=$HOME
	export XDG_DATA_HOME=$OPENSHIFT_DATA_DIR/.local
	export XDG_CONFIG_DIR=$OPENSHIFT_DATA_DIR/.config
	export XDG_CACHE_HOME=$OPENSHIFT_DATA_DIR/.cache
	cd $OPENSHIFT_REPO_DIR
	HOME=$OPENSHIFT_DATA_DIR bower install
	HOME=$HOMEBACKUP
else
	echo "development env"
	bower install
fi
