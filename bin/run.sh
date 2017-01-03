#! /bin/bash

export RUN_PATH=`dirname "$0" || echo .`
set -a
. ${RUN_PATH}/_config.sh
set +a

docker stop ${KUBERNETES_DEPLOYMENT}
docker rm ${KUBERNETES_DEPLOYMENT}
docker run -d -p 8880:80 -p 8843:443 --name ${KUBERNETES_DEPLOYMENT} \
  -v ${PWD}/app.js:/usr/src/httpjs/app.js \
  --env-file ENV ${IMAGE}
docker logs -f ${KUBERNETES_DEPLOYMENT}


# -v ${PWD}/etc/simplesamlphp-config:/feide/vendor/simplesamlphp/simplesamlphp/config \
# -v ${PWD}/etc/simplesamlphp-metadata:/feide/vendor/simplesamlphp/simplesamlphp/metadata \
# --link cassameta:cassandra \
