#$!/bin/sh

# source conzept environment variables
. /etc/conzept/settings.conf

cd "$CONZEPT_SERVICES_DIR/europeana"

npm run start
