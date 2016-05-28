#!/bin/bash
browserify snippet.js -t [ babelify --presets es2015 ] -g uglifyify > bundle.js
