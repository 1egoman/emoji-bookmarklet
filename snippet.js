"use strict";
const $ = require("jquery"),
      twemoji = require("twemoji"),
      Promise = require("promise-polyfill");

const punctuation = /([!"#\$%&'\(\)\*\+,-.\/:;\<=>\?@\[\]\^_`{\|}~])$/g;

// remove punctuation from a word so it will match.
function cleanWord(word) {
  return {
    clean: word.replace(punctuation, "").toLowerCase(),
    ends: word.match(punctuation),
  }
}

// get the emoji character for a word
function getEmoji(inword) {
  if (inword.length < 4) {
    return null;
  } else {
    return new Promise((resolve, reject) => {
      let word = cleanWord(inword);
      $.get("https://www.emojidex.com/api/v1/search/emoji?code_sw="+word.clean).then(function(i) {
        resolve({
          endsWith: word.ends,
          payload: i.emoji.reverse().find(i => i.unicode && i.unicode.length),
        });
      }, reject);
    });
  }
}

$(document).ready(function() {
  $("p").each(function(i) {
    let words = $(this).text().split(" ");

    // loop by words
    let promises = words.map(word => getEmoji(word));

    // loop through all promises and get the emoji for each word
    Promise.all(promises).then(emojis => {
      let text = emojis.map((emoji, ct) => {
        if (emoji && emoji.payload) {
          // get word content
          let content;
          if (emoji.endsWith) {
            content = words[ct].slice(0, words[ct].length - emoji.endsWith.length);
          } else {
            content = words[ct];
          }

          let emojiString = twemoji.parse(
            String.fromCodePoint(parseInt(emoji.payload.unicode, 16))
          );

          return `
            <span
            style='cursor: default;'
            title='${content}'>
            ${emojiString}
            </span>` + (emoji.endsWith || "");
        } else {
          return words[ct];
        }
      }).join(" ");

      this.innerHTML = text;
    });
  });

  $("head").append(`<style> img.emoji { height: 1em; padding: 0px; margin: 0px; } </style>`);
});

