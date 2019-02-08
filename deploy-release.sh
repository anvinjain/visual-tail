#!/bin/bash

REMOTE_SERVER="10.32.213.65"
REMOTE_LOCATION="/home/ankurjain.v/visual-tail"
LOCAL_LOCATION="/Users/ankurjain.v/Downloads"
RELEASE_FILE="release_1.0.0.tar.gz"
DGREP_API="http://10.47.5.141/query"

ssh -t $REMOTE_SERVER "sudo apt-get install nginx; rm -rf ${REMOTE_LOCATION}; mkdir ${REMOTE_LOCATION}"
scp "${LOCAL_LOCATION}/${RELEASE_FILE}" $REMOTE_SERVER:$REMOTE_LOCATION
ssh -t $REMOTE_SERVER "cd ${REMOTE_LOCATION}; tar -xvzf ${RELEASE_FILE}; rm -rf ${RELEASE_FILE}"

cat > ${LOCAL_LOCATION}/config.js <<EOL
var config = {
  logsApi: "${DGREP_API}"
}
EOL

scp "${LOCAL_LOCATION}/config.js" $REMOTE_SERVER:$REMOTE_LOCATION/dist/js

cat > ${LOCAL_LOCATION}/vt.conf <<EOL
server {
  server_name localhost;
  listen 80;
  root ${REMOTE_LOCATION};
}
EOL

scp "${LOCAL_LOCATION}/vt.conf" $REMOTE_SERVER:$REMOTE_LOCATION
ssh -t $REMOTE_SERVER "sudo cp $REMOTE_LOCATION/vt.conf /etc/nginx/sites-available"
ssh -t $REMOTE_SERVER "sudo rm /etc/nginx/sites-enabled/default"
ssh -t $REMOTE_SERVER "sudo ln -s /etc/nginx/sites-available/vt.conf /etc/nginx/sites-enabled/vt.conf"
ssh -t $REMOTE_SERVER "sudo service nginx restart"