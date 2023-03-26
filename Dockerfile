
# FROM node:16.18.0-alpine AS node

FROM nginx:1.20-alpine

EXPOSE 8000
CMD ["/sbin/entrypoint.sh"]

# RUN apk -U upgrade \
#   && apk add --repository https://dl-cdn.alpinelinux.org/alpine/v3.10/main/ --no-cache \
#     "nodejs<16" \
#   && apk add --no-cache npm

RUN apk add --no-cache --update \
    php7 \
    php7-bcmath \
    php7-ctype \
    php7-curl \
    php7-dom \
    php7-fileinfo \
    php7-fpm \
    php7-gd \
    php7-intl \
    php7-json \
    php7-mbstring \
    php7-mcrypt \
    php7-opcache \
    php7-openssl \
    php7-phar \
    php7-posix \
    php7-session \
    php7-simplexml \
    php7-tokenizer \
    php7-xml \
    php7-xmlwriter \
    php7-zip \
    php7-zlib \
    sudo \
    wget git curl bash grep make build-base jq\
    supervisor nodejs-current npm

RUN npm install -g minify minify-json clean-css-cli @swc/cli @swc/core webpack webpack-cli esbuild
# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log && \
    ln -sf /dev/stdout /var/log/php7/error.log && \
    ln -sf /dev/stderr /var/log/php7/error.log

RUN adduser -S -s /bin/bash -u 1001 -G root www-data

RUN touch /var/run/nginx.pid && \
    chown -R www-data:root /var/run/nginx.pid

RUN chown -R www-data:root /etc/php7/php-fpm.d

RUN mkdir -p /var/www/html && \
    mkdir -p /usr/share/nginx/cache && \
    mkdir -p /var/cache/nginx && \
    mkdir -p /var/lib/nginx && \
    chown -R www-data:root /var/www /usr/share/nginx/cache /var/cache/nginx /var/lib/nginx/

WORKDIR /var/www/html/
# USER 1001
COPY --chown=www-data:root ./app/ ./app/
# RUN ls -la
RUN cd app/explore2 && npm i && sh build.sh

COPY --chown=www-data:root . .
# RUN chown -R www-data:root /var/www/html

COPY conf/php-fpm-pool.conf /etc/php7/php-fpm.d/www.conf
COPY conf/supervisord.conf /etc/supervisor/supervisord.conf
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/nginx-site.conf /etc/nginx/conf.d/default.conf
COPY conf/.env.docker /var/www/html/.env
COPY entrypoint.sh /sbin/entrypoint.sh

ARG CONZEPT_CERT_NAME="example-cert"
ARG CONZEPT_SERVER_NAME="example-server"
ARG CONZEPT_DOMAIN="example-domain"

ENV CONZEPT_CERT_NAME=$CONZEPT_CERT_NAME
ENV CONZEPT_SERVER_NAME=$CONZEPT_SERVER_NAME
ENV CONZEPT_DOMAIN=$CONZEPT_DOMAIN
RUN grep -l "\$CONZEPT_CERT_NAME" /etc/nginx/conf.d/default.conf | xargs sed -i "s/\$CONZEPT_CERT_NAME/$CONZEPT_CERT_NAME/g"
# RUN grep -l "\$CONZEPT_SERVER_NAME" /etc/nginx/conf.d/default.conf | xargs sed -i "s/\$CONZEPT_SERVER_NAME/$CONZEPT_SERVER_NAME/g"
RUN grep -l "\$CONZEPT_DOMAIN" /etc/nginx/conf.d/default.conf | xargs sed -i "s/\$CONZEPT_DOMAIN/$CONZEPT_DOMAIN/g"


# USER root
RUN chmod -v g+rwx /var/run/nginx.pid && \
    chmod -vR g+rw /usr/share/nginx/cache /var/cache/nginx /var/lib/nginx/ /etc/php7/php-fpm.d
USER 1001
