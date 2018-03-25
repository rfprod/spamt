#!/bin/bash

# read and set vars from .env file
export $(cat .env | sed 's/^/export /')
echo 'MONGO_FILE_PATH =' $MONGO_FILE_PATH

if [ -z ${MONGO_FILE_PATH+x} ]; then
	MONGO_FILE_PATH="${HOME}/mongo"
	echo 'set default mongo path ' $MONGO_FILE_PATH
else
	echo 'mongo path is set in .env ' $MONGO_FILE_PATH
fi

if [ ! -d $MONGO_FILE_PATH ]; then
	mkdir "${MONGO_FILE_PATH}"
	echo 'created directory for mongo databases'
else
	echo 'directory for mongo database exists'
fi

if [ ! -d ${MONGO_FILE_PATH}"/spamt/" ]; then
	DIR="${MONGO_FILE_PATH}/spamt/"
	mkdir $DIR
	echo 'created directory for app database, path' $DIR
else
	echo 'directory for app database exists'
fi

# unset vars read from .env file
unset $(cat .env | grep -v ^# | sed -E 's/(.*)=.*/\1/' | xargs)
echo 'unset MONGO_FILE_PATH =' $MONGO_FILE_PATH
