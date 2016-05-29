#!/bin/bash

# build the main code
browserify snippet.js -t [ babelify --presets es2015 ] -g uglifyify > bundle.js
echo "main built!"

# build the activator code
# then, encode the whole thing and insert it into the file
ACTIVATOR=$(browserify activator.js -g uglifyify | perl -MURI::Escape -ne 'print uri_escape($_)')
perl -pe "s(\\Q[CODE])(\\Q$ACTIVATOR)" index.link.html | sed 's/\\//g' > index.html
echo "activator built!"
