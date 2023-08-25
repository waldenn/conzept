#!/bin/bash
git pull
docker compose build
docker compose up -d
docker system prune -f
