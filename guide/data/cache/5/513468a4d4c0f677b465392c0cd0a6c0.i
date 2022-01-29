a:9:{i:0;a:3:{i:0;s:14:"document_start";i:1;a:0:{}i:2;i:0;}i:1;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:12:"installation";i:1;i:1;i:2;i:1;}i:2;i:1;}i:2;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:1;}i:2;i:1;}i:3;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:1;}i:4;a:3:{i:0;s:4:"html";i:1;a:1:{i:0;s:3979:"
<pre>
log how to install a new Conzept server:

- TODO:
  - environment variables for:
    - conzept_host ("dev.conze.pt")
    - conzept_web_directory ("/var/www/html")
    - conzept_youtube_api_key (optional)
    - ...

 - setup proxy services
  - better build script
    - use import

  - create a build tool using:
    - work-code layout design
    - production-code layout design
    - register, install and write imports
    - use https://esbuild.github.io or https://swc.rs

  - insert build-git-repo

- change hostname:
  - vi /etc/hostname
  - sudo reboot now

- install packages:
  - sudo apt install apache2 apache2-bin apache2-data apache2-utils libapache2-mod-php7.4 libapache2-mod-php libapache2-mod-uwsgi php-fpm snapd nodejs npm sed

- install certbot:
  - sudo snap install core; sudo snap refresh core
  - sudo snap install --classic certbot
  - sudo ln -s /snap/bin/certbot /usr/bin/certbot
  - sudo certbot --apache
  - test certbot: sudo certbot renew --dry-run

- setup apache2
  - sudo a2enmod proxy proxy_http headers expires
  - sudo systemctl restart apache2

  - edit the apache site config:

    &lt;IfModule mod_ssl.c&gt;
    &lt;VirtualHost *:443>
            ServerName conze.pt

            ServerAdmin webmaster@localhost
            DocumentRoot /var/www/html

            ErrorLog ${APACHE_LOG_DIR}/error.log
            CustomLog ${APACHE_LOG_DIR}/access.log combined

            ProxyRequests Off
                 ProxyPreserveHost On
                 ProxyVia Full
                 &lt;Proxy *&gt;
                    Require all granted
                 &lt;/Proxy>

                 &lt;Location /app/proxy&gt;
                    # command: conzept-api-proxy.sh 
                    ProxyPass http://127.0.0.1:50001
                    ProxyPassReverse http://127.0.0.1:50001
                 &lt;/Location&gt;

                 &lt;Location /app/cors&gt;
                    # command: npm start allOrigins/app.js
                    ProxyPass http://127.0.0.1:1458
                    ProxyPassReverse http://127.0.0.1:1458
                 </Location>

            &lt;Directory "/var/www/html"&gt;
             Options Indexes FollowSymLinks MultiViews
             AllowOverride All
             Require all granted
            &lt;/Directory&gt;

            ServerName dev.conze.pt
            SSLCertificateFile /etc/letsencrypt/live/dev.conze.pt/fullchain.pem
            SSLCertificateKeyFile /etc/letsencrypt/live/dev.conze.pt/privkey.pem
            Include /etc/letsencrypt/options-ssl-apache.conf

    &lt;/VirtualHost&gt;
    &lt;/IfModule&gt;

  - sudo systemctl restart apache2

- install node:
  - curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  - nvm install --lts
  - (exit shell)
  - npm install -g minify clean-css-cli @swc/cli @swc/core

- download build script: 

- insert main repo
  - git clone https://github.com/waldenn/conzept.git 
  - move directory content to /var/www/html

- insert build repo
  - run all builds (with correct domain and paths)

- setup boot-services
  - TODO: install json-proxy with "/home/jama/bin/proxy.json"
  - TODO: install allOrigins
    - TODO: add white-list for requesting-domain to prevent abuse

  - sudo vi /etc/rc.local

    #!/bin/sh -e

    # CORS-proxy for JSON (eg. used for the YouTube-video-API. PORT: 50001)
    /home/jama/.nvm/versions/node/v14.2.0/bin/json-proxy -p 50001 -c "/home/jama/bin/proxy.json" &

    # CORS-proxy for non-JSON files (PORT: 1458)
    cd /home/jama/dev/allOrigins && npm start app.js &

    exit 0

- setup crontab commands
  - sudo su && crontab -e

    # check every day at 10:30 if certificate reneweal is needed
    30 10 * * * sudo certbot renew >> /tmp/certbot-cron.log > /dev/null 2>&1

    # fetch conzept cover data for the previous month (wait until the second day of the month, so the stats are available)
    0 0 2 * * sudo /var/www/html/app/explore2/tools/get_previous_month_covers.sh

</pre>
";}i:2;i:35;}i:5;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:0:"";}i:2;i:4021;}i:6;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:4021;}i:7;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:4021;}i:8;a:3:{i:0;s:12:"document_end";i:1;a:0:{}i:2;i:4021;}}