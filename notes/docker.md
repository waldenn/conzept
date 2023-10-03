# Notes on working with Docker
## Context
Docker is used to host and run conzept. It is also used to facilitate rapid development. These notes collate various tidbits of information related to working effectively with Docker.

## Questions to comprehend
Here are the volume mappings from the current `docker_compose.yml` file:
```
      - sslvolume:/etc/ssl
      - ./data/certbot/conf:/etc/letsencrypt/
      - ./data/certbot/www:/var/www/certbot
```
Questions

1. What is the effect of a trailing slash on the path to the host folder?
1. Where are paths relative to? e.g. in `./data` - presumably to the current folder where the `docker run` command is about to be run. 
2. What happens if there are permission issues?
3. What happens if the folder doesn't exist 
   1. on the host? 
   1. in the container?
4. Why use a docker-compose.yml vs. docker command line volume definitions?
5. How we can inspect and debug volumes from within the running docker container?

## Useful commands

- Finding containers: `sudo docker ps` for the current, running instances; and `sudo docker ps -a` which includes old, defunct instances.
- Inspecting a container, starts simple, with `sudo docker inspect e2e912d46800`.
- This can be filtered and formatted to focus on a subset of the info, e.g. `sudo docker inspect -f '{{ json .Mounts }}' e2e912d46800 | jq` combines Docker's `inspect` command with a filter to obtain the mounts and format them as `json`. These are piped to `jq` so they are laid out attractively.
- To run a terminal process within a docker container: `docker run -it conzept-conzept /bin/bash`
- To stop a running Docker instance `sudo docker stop conzept`

Experimental Docker commands:
- A quick way to test a volume mapping using the command-line: `sudo docker run -v .:/tmp/here -it --rm --name helloworld alpine ash -c "echo helloworld ; sh"` - This:
  - Maps the current host directory `.` to `/tmp/here` (which doesn't exist in this container). 
  - On starting the container with this command the following commands demonstrate the folder exists in the container, creates a file, and modifies the permissions of the file so the file can also be edited from the host terminal.
- `sudo docker run -v .:/tmp/here -v ../data:/tmp/data -it --rm --name helloworld alpine ash -c "echo helloworld ; sh"` extends the previous command and attempts to share another folder as a volume from the parent folder. This command is rejected by docker because of the `..` in the host file path.
- `sudo docker run -v .:/tmp/here -v /home/julian/NLnet-Projects/conzept/data:/tmp/data -it --rm --name helloworld alpine ash -c "echo helloworld ; sh"` replaces the .. with the full path and is accepted. The second volume `/tmp/data` *is* available in the running container, tested using `ls -lart /tmp/data` within the running container.
- `sudo docker run -v .:/tmp/here -v /home/julian/NLnet-Projects/conzept/data:/tmp/data/ -it --rm --name helloworld alpine ash -c "echo helloworld ; sh"` includes a trailing slash on the path to use inside the container `/tmp/data/` this works without complaint.
- Moving on to the first of the 3 volumes mapped in this project's `docker-compose.yml` file: `sudo docker run -v .:/tmp/here -v /home/julian/NLnet-Projects/conzept/data/certbot/conf:/etc/letsencrypt -it --rm --name helloworld alpine ash -c "echo helloworld ; sh"`. The mapping works and was checked using this command within the running container `ls -lart /etc/letsencrypt/`. 
- [BTW we could use commands such as `touch` on the command to touch a file in the expected destination folder then check from the host computer directly, rather than logging into the container]. Here's a quick example: `sudo docker run -v .:/tmp/here -v /home/julian/NLnet-Projects/conzept/data/certbot/conf:/etc/letsencrypt -it --rm --name helloworld alpine ash -c "echo helloworld > /etc/letsencrypt/fromdocker ; sh"/ # ls -lart /etc/letsencrypt/`


Expected state of the container *without* local development volumes enabled:
```
sudo docker ps
CONTAINER ID   IMAGE             COMMAND                  CREATED         STATUS         PORTS                                                                                NAMES
6f2e399efe77   conzept-conzept   "/docker-entrypoint.…"   4 minutes ago   Up 4 minutes   0.0.0.0:80->80/tcp, :::80->80/tcp, 0.0.0.0:443->443/tcp, :::443->443/tcp, 8000/tcp   conzept
```

And *with* local development volumes enabled:
```
sudo docker ps
CONTAINER ID   IMAGE             COMMAND                  CREATED          STATUS          PORTS                                                                                NAMES
7ca24dc09e0d   conzept-conzept   "/docker-entrypoint.…"   12 minutes ago   Up 12 minutes   0.0.0.0:80->80/tcp, :::80->80/tcp, 0.0.0.0:443->443/tcp, :::443->443/tcp, 8000/tcp   conzept
8397a43e984f   8f9338e1786a      "/docker-entrypoint.…"   39 hours ago     Up 38 hours     80/tcp, 8000/tcp                                                                     conzept-2023-10-02
(base) julian@julian-Precision-Tower-7910-128GB:~/NLnet-Projects/conzept$ sudo docker inspect -f '{{ json .Mounts }}' 7ca24dc09e0d | jq
[
  {
    "Type": "bind",
    "Source": "/home/julian/NLnet-Projects/conzept/data/certbot/www",
    "Destination": "/var/www/certbot",
    "Mode": "rw",
    "RW": true,
    "Propagation": "rprivate"
  },
  {
    "Type": "volume",
    "Name": "conzept_app",
    "Source": "/var/lib/docker/volumes/conzept_app/_data",
    "Destination": "/var/www/html/app",
    "Driver": "local",
    "Mode": "rw",
    "RW": true,
    "Propagation": ""
  },
  {
    "Type": "volume",
    "Name": "e68153ec699b30947fe2816756c0cefa05256565d6cf662e01443692f641640c",
    "Source": "/var/lib/docker/volumes/e68153ec699b30947fe2816756c0cefa05256565d6cf662e01443692f641640c/_data",
    "Destination": "/var/www/html/app/explore2/node_modules",
    "Driver": "local",
    "Mode": "z",
    "RW": true,
    "Propagation": ""
  },
  {
    "Type": "volume",
    "Name": "conzept_sslvolume",
    "Source": "/var/lib/docker/volumes/conzept_sslvolume/_data",
    "Destination": "/etc/ssl",
    "Driver": "local",
    "Mode": "z",
    "RW": true,
    "Propagation": ""
  },
  {
    "Type": "bind",
    "Source": "/home/julian/NLnet-Projects/conzept/data/certbot/conf",
    "Destination": "/etc/letsencrypt",
    "Mode": "rw",
    "RW": true,
    "Propagation": "rprivate"
  }
]
```

From the above mounts, I can find and write to the volume that is mapped from `app:` to `/var/www/html/app` e.g.: 
`sudo touch /var/lib/docker/volumes/conzept_app/_data/using_to_docker_volume`

Within a shell in the running Docker container (obtained using `sudo docker exec -it conzept sh`) I can write to files and read those that I've written from the host system. Here's an extract from an `ls -lart` command for the app folder:
```
... lots of entries removed...
-rw-r--r--  1 root     root    0 Oct  3 21:01 fromdocker
-rw-r--r--  1 root     root    0 Oct  3 21:10 using_to_docker_volume
drwxrwxr-x 60     1000 1000 4096 Oct  3 21:10 .
/var/www/html # ls -lart app

```

## External material

- TBC