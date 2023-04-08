#!/usr/bin/env bash

# DOCKER INSTALL

printf "\nInstalling Docker and its dependencies...\n"

docker_compose_version="v2.17.2" # see latest: https://github.com/docker/compose/tags

user=$(echo $USER)

sudo apt update

sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  # FIXME: GPG-key issue: “W: https://download.docker.com/linux/ubuntu/dists/jammy/InRelease: Key is stored in legacy trusted.gpg keyring (/etc/apt/trusted.gpg), see the DEPRECATION section in apt-key(8) for details.” https://joshtronic.com/2023/01/08/key-is-stored-in-legacy-trusted-gpg-keyring/

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

sudo apt-get update

sudo apt-get -y install docker-ce

#sudo systemctl status docker

sudo usermod -a -G docker $user

sudo curl -L "https://github.com/docker/compose/releases/download/$docker_compose_version/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

printf "\nDone. Please logout and login again, to activate the group permissions.\n"
