#!/bin/bash

# read and set vars from .env file
export $(cat .env | sed 's/^/export /')
echo 'MONGO_FILE_PATH =' $MONGO_FILE_PATH

if [ -z ${MONGO_FILE_PATH+x} ]; then
	MONGO_FILE_PATH="${HOME}/mongo/"
	echo 'set default mongo path ' $MONGO_FILE_PATH
else
	echo 'mongo path is set in .env ' $MONGO_FILE_PATH
fi

mongod --smallfiles --dbpath ${MONGO_FILE_PATH}"spamt"

# unset vars read from .env file
unset $(cat .env | grep -v ^# | sed -E 's/(.*)=.*/\1/' | xargs)
echo 'unset MONGO_FILE_PATH =' $MONGO_FILE_PATH
