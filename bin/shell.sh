#! /bin/bash

export RUN_PATH=`dirname "$0" || echo .`
set -a
. ${RUN_PATH}/_config.sh
set +a

docker exec -ti ${KUBERNETES_DEPLOYMENT} bash
