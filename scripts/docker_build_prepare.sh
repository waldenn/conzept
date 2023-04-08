#!/usr/bin/env bash

# CONZEPT DOCKER BUILD PREPARE

sudo apt install -y git unzip

if [ ! -d "conzept" ]; then
  echo "Fetching the Conzept sources"
  # TODO: replace with Github source repo later
  git clone -b "feature/docker-support" https://github.com/waldenn/conzept.git conzept
  unzip docker-support.zip -d conzept
else
  echo "The 'conzept' directory already exists"
fi

cd conzept &&

if [ ! -f "settings.conf" ]; then
  echo "Copying the settings template file to 'settings.conf'. Edit this file for your system!"
  cp settings.conf.example settings.conf
else
  echo "Building the Conzept docker image, based on the 'settings.conf' file"
  docker-compose build
fi

# update doc, first git clone, then edit settings, then run this script
printf "Now edit the Conzept 'settings.conf' file,\n  run either: 'docker-compose up -d' (to build and run the docker image)\n or: 'docker-compose build' (to only build the docker image and then run './init-https.sh' manually)\n"
