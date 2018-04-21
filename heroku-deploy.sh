#!/bin/bash

# colours
source util-echo_colours.sh
# DEFAULT, BLACK, DARK_GRAY, RED, LIGHT_RED, GREEN, LIGHT_GREEN, BROWN, YELLOW,
# BLUE, LIGHT_BLUE, PURPLE, LIGHT_PURPLE, CYAN, LIGHT_CYAN, LIGHT_GRAY, WHITE

printf "${LIGHT_GREEN} * heroku-deploy > ${GREEN}step 1:${YELLOW} checkout branch heroku-deploy${DEFAULT}\n"
git checkout -b heroku-deploy

printf "${LIGHT_GREEN} * heroku-deploy > ${GREEN}step 2:${YELLOW} stop ignoring built application with .gitignore${DEFAULT}\n"
gulp dont-gitignore-build

printf "${LIGHT_GREEN} * heroku-deploy > ${GREEN}step 3:${YELLOW} set DEV_MODE=false in .env${DEFAULT}\n"
gulp dont-use-cluster

printf "${LIGHT_GREEN} * heroku-deploy > ${GREEN}step 4:${YELLOW} build application${DEFAULT}\n"
gulp compile-and-build

printf "${LIGHT_GREEN} * heroku-deploy > ${GREEN}step 5:${YELLOW} add all built application files${DEFAULT}\n"
git add --all

printf "${LIGHT_GREEN} * heroku-deploy > ${GREEN}step 6:${YELLOW} commit${DEFAULT}\n"
git commit -m "(build) heroku build"

printf "${LIGHT_GREEN} * heroku-deploy > ${GREEN}step 7:${YELLOW} puh to heroku${DEFAULT}\n"
git push heroku master

printf "${LIGHT_GREEN} * heroku-deploy > ${GREEN}step 8:${YELLOW} checkout master${DEFAULT}\n"
git checkout master

printf "${LIGHT_GREEN} * heroku-deploy > ${GREEN}step 9:${YELLOW} delete branch heroku-deploy with build commit${DEFAULT}\n"
git branch -D heroku-deploy
