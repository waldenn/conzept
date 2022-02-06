#!/bin/sh -e

# CONZEPT BUILD SCRIPT

user="conzept"
confdir="/etc/conzept"

# clear build directory (not really required)
if [ -d "dist" ] 
then
  rm -r dist/
fi

# create conzept user (used for running the proxy services)
if ! id -u "$user" >/dev/null 2>&1; then
  echo 'creating conzept user'
  sudo adduser --quiet --no-create-home --disabled-password --shell /bin/sh --gecos "User" conzept
fi

# TODO: check & create confdir
if ! [ -d $confdir ]
then
  sudo mkdir $confdir
fi

# TODO: check & create conzept settings file
if ! [ -f "$confdir/settings.conf" ]
then
  echo "creating \"$confdir/settings.conf\", please edit this file for your Conzept setup"
  sudo cp settings.example.conf "$confdir/settings.conf"
fi

# source environment variables
. "$confdir/settings.conf" &&

# check for htaccess file
if ! [ -f "$CONZEPT_WEB_DIR/.htaccess" ] 
then
  echo "inserting .htaccess file"
  cp htaccess.example "$CONZEPT_WEB_DIR/.htaccess"
  exit 0
fi

# run some tools
  cd tools &&

  # generate the JS-based environment file from the above environment variables
  ./env-to-js.sh &&

  # transform template HTML and PHP files (by inserting environment variables)
  # note: this command transforms all embedded app template-files.
  ./template_transform.sh &&

  # setup conzept services (CORS/JSON proxies)
  ./conzept_services_setup.sh

  cd .. &&

# build the Conzept wikipedia-app
cd ../wikipedia &&
npm i &&
npm run build &&
cd ../explore2 &&

# build the main Conzept app
esbuild src/core/* src/fetch/* src/data/* src/webcomponent/* --outdir=dist --minify &&

# build CSS
esbuild css/conzept/* css/openmoji/* css/various/* --outdir=dist/css/ --minify &&

# bundle all API fetch scripts into one file
cat dist/fetch/* > dist/core/fetches.js &&

# add keyboardJS library to utils
cat ./node_modules/keyboardjs/dist/keyboard.min.js >> dist/core/utils.js
