#!/bin/bash

# clear build directory
rm -r dist

# JS
esbuild js/* --outdir=dist/js/ --minify

# CSS
esbuild css/* --outdir=dist/css/ --minify
esbuild skins/* --outdir=dist/css/skins/ --minify

# fonts
cp -r fonts/ dist/css/
