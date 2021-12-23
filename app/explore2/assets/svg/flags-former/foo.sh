#!/bin/bash
IFS=' | '
while read line; do
  echo $line
done < foo.js
