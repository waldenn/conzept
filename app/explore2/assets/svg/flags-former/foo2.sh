#!/bin/bash

#Input file
_db="foo.js"
 
#Output location
o="/var/www/prviate/pdf/faq"
 
_writer="~/bin/py/pdfwriter.py"
 
# If file exists 
if [[ -f "$_db" ]]
then
  while IFS='|' read -r qid url
    do
      wget -O $qid.svg $url
    done <"$_db"
fi
