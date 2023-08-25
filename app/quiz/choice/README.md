# Who painted this?

A small game that lets you guess who created a painting.

Play at https://whopaintedthis.toolforge.org/

The data comes from [Wikidata](https://www.wikidata.org/).

This project was created during the 2022
[Wikimania Hackathon](https://wikimania.wikimedia.org/wiki/Hackathon).

## Running it locally

```
npm install
npm run dev
```

## Deploying

This project is deployed on [Toolforge](https://wikitech.wikimedia.org/wiki/Portal:Toolforge).

The Node.js version on the Toolforge bastion is too old, so you must run the
build locally and commit the "dist" folder:

```
npm run build
git add .
git commit -m "Build vX.Y.Z"
git push
```

Then deploy from the Toolforge bastion (please note that you must be a member of
the project on Toolforge):

```
ssh login.toolforge.org

$ become whopaintedthis
tools.whopaintedthis@tools-sgebastion-10:~$ cd wikidata-painters/
tools.whopaintedthis@tools-sgebastion-10:~/wikidata-painters$ git pull
```

