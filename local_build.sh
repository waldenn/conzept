#!/bin/bash
docker compose build
sudo ./init-https.sh
#docker compose up --force-recreate -d
