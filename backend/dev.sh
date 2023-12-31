#!/bin/bash

trap 'kill -SIGTERM $(jobs -p)' SIGTERM
trap 'kill -SIGINT $(jobs -p)' SIGINT

npm run migrate
#nice -n 19 dockerd &>/dev/null &
nodemon --legacy-watch ./src/index.ts &

wait -n
exit $?
