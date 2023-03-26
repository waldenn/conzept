#!/bin/bash
# set -o errexit -o nounset -o pipefail

[ "${DEBUG:-false}" == true ] && set -x



initialize_system() {
  echo "Initializing Conzept container ..."

  PHP_MAX_CHILDREN=${PHP_MAX_CHILDREN:-5}
  # # configure conf files
  sed 's,{{PHP_MAX_CHILDREN}},'"${PHP_MAX_CHILDREN}"',g' -i /etc/php7/php-fpm.d/www.conf

}

start_system() {
  initialize_system
  echo "Starting Conzept! ..."
  . /etc/conzept/settings.conf
  /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
}

start_system

exit 0
