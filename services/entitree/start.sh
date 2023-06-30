#!/bin/sh

# source conzept environment variables
. /etc/conzept/settings.conf

cd "$CONZEPT_SERVICES_DIR/entitree"

npm run start
