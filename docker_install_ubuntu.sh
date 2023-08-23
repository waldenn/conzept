#!/usr/bin/env bash

# Ubuntu-Linux Docker-install script

printf "\nInstalling Docker and its dependencies on Ubuntu Linux...\n"

docker_compose_version="v2.20.3" # see latest: https://github.com/docker/compose/tags

user=$(echo $USER)

sudo apt update

sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common cron jq

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository -y "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

sudo apt-get update

sudo apt-get -y install docker-ce docker-compose-plugin

#sudo systemctl status docker

sudo usermod -aG docker $user

printf "\nDone. Please logout and login again, to activate the docker group permissions.\n"
