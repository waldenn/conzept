#!/bin/bash
docker compose build --no-cache
sudo ./init-https.sh
docker system prune -f
