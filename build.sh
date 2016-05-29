#!/bin/bash

# build the main code
browserify js/snippet.js -t [ babelify --presets es2015 ] -g uglifyify > bundle.js
echo "main built!"

# build the activator code
# then, encode the whole thing and insert it into the file
ACTIVATOR=$(browserify js/activator.js -g uglifyify | perl -MURI::Escape -ne 'print uri_escape($_)')
perl -pe "s(\\Q[CODE])(\\Q$ACTIVATOR)" html/index.link.html | sed 's/\\//g' > index.html
echo "activator built!"

# build stylesheets
node-sass --output-style compressed scss/styles.scss style.min.css
