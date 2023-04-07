See the setup documention [here](https://conze.pt/guide/installation)

# Docker
TODO- add instruction

to run this project in your own server you will first need to install the following:
perquisites:
    - docker and docker-compose
    - Ubuntu server

### Install Docker
you can run the f
```bash
# 'updating server'
# craete vm azure with cli
$ apt update

# '====>>> installing certificats'
$ apt-get -y install apt-transport-https ca-certificates curl software-properties-common

$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

# '====>>> adding original docker repos'

$ add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"

# '====>>> installing docker from original repo'

$ apt-get -y install docker-ce

# '====>>> adding current logged in user to docker group'

$ usermod -a -G docker $USER

```
we will also need to install docker-compose.

```bash
$ curl -L "https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

$ chmod +x /usr/local/bin/docker-compose
```

### setup your domain
 you need to change your domain DNS Configuration for this to run add the your server public ip as an A record in you domain provider website.
### Configure Settings.conf
for this you need to add your domain to Settings.conf file, ig you don't have that file already follow the instruction below:

```bash
$ cp settings.conf.example settings.conf
```
then open the file with you favorite editor and change the following variables.
`CONZEPT_HOSTNAME` and `CONZEPT_EMAIL`.
**CONZEPT_HOSTNAME**: this is your domain that you want to use with the app, and you will access the app through this domain
**CONZEPT_EMAIL**: this email is used in various places in the app and the main area where we will be using it is when we will be generating the ssl certificate for your domain.

### Start the Application

Now after we have docker and docker-compose installed and our variables in the settings.conf are setup, now we can just do two simple steps to start the project.


first we need to start the services in this step we will have some problems with the conzept service as it references some SSL certificat files that doesn't find, wich is fine for now
 ```bash
 $ docker-compose up -d
 ```

after we run this command we need to generate the certificates with `init-https.sh` script
```bash
./init-https.sh
```
this will create a dummy certificate to start the project and then generate the calid SSL certificate for your own domain.
