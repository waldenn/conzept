#!/bin/sh

# source conzept environment variables
. /etc/conzept/settings.conf &&

# create dir
if ! [ -d "$CONZEPT_SERVICES_DIR" ]
then
  echo "Error: Conzept services directory does not exist: \"$CONZEPT_SERVICES_DIR\""
fi

cd $CONZEPT_SERVICES_DIR &&

# setup AllOrigins service
if ! [ -d "allorigins/node_modules" ]
then
  echo "setting up Allorigins"
  cd allorigins &&
  npm install &&
  cd ..
fi

# setup json-proxy service
if ! [ -f "json-proxy.json" ]
then
  cd json-proxy &&
  npm install &&
  cd ..
  echo "setting up json-proxy configuration file"
  echo "
   {
      \"proxy\": {
        \"forward\": {
          \"/video/(.*)\": \"https://www.googleapis.com/youtube/v3/\$1&key=YOUR_YOUTUBE_API_KEY\",
          \"/scholar/(.*)\": \"https://scholar-qa.archive.org/search/?q=lang%3A\$1\"
        },
        \"headers\": {
          \"content-type\": \"application/json\"
        }
      }
    }" > json-proxy.json
fi
