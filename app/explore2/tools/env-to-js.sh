#!/bin/sh

# create a JS-compatible environment file (from the shell environment settings)

# output file
file='../src/core/env.js'

jq -n env | grep CONZEPT | grep -v HTML_INCLUDE | grep -v DIR | grep -v KEY > $file &&

sed -i 's/":/ =/g' $file &&
sed -i 's/^\s*"/const /g' $file &&
sed -i 's/,$/;/g' $file
