"use strict";
const $ = require("jquery"),
      twemoji = require("twemoji"),
      memoizePromise = require("memoize-promise"),
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
let getEmoji = memoizePromise(function getEmoji(inword) {
  if (inword.length < 4) {
    return Promise.resolve(null);
  } else {
    return new Promise((resolve, reject) => {
      let word = cleanWord(inword);
      $.get("https://www.emojidex.com/api/v1/search/emoji?code_sw="+word.clean).then(function(i) {
        resolve({
          endsWith: word.ends,
          payload: i.emoji.find(i => word.length <= i.length + 2),
        });
      }, reject);
    });
  }
});

$(document).ready(function() {
  let all = $("p, p strong, p em, p b, span, h1, h2, h3, h4, h5, h6");
  let total = all.length;

  $("body").prepend("<p class='loading-emoji'>Loading Emoji...</p>")

  all.each(function(i) {
    let words = Array.prototype.concat.apply(
      [],
      $(this).contents().map((ct, item) => {
        if (item.nodeType === 3) { // is text?
          return item.data.split(" ");
        } else {
          return item;
        }
      })
    ).filter(i => {
      if (typeof i === "string") {
        return i.trim().length > 0;
      } else {
        return true;
      }
    });

    // loop by words
    let promises = words.map(word => {
      if (typeof word === "string") {
        return getEmoji(word)
      } else {
        return null;
      }
    });

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
          content = content.split("\n").join(" ");

          // assemble the emoji string image
          let emojiString = twemoji.parse(
            String.fromCodePoint(parseInt(emoji.payload.unicode, 16))
          );

          // return the markup
          return `
            <span
            style='cursor: default;'
            title='${content}'>
            ${emojiString}
            </span>` + (emoji.endsWith || "");
        } else if (typeof words[ct] !== "string") {
          return $(words[ct]).prop('outerHTML');
        } else {
          return words[ct];
        }
      }).join(" ");

      this.innerHTML = text;
    }).then(() => {
      // on final iteration
      total--;
      console.log(total, "emoji left...");
      if (total <= 0) {
        $(".loading-emoji").remove();
      }
    }).catch((error) => {
      total--;
      console.error(error);
    });
  });

  $("head").append(`<style>
    img.emoji { height: 1em; padding: 0px; margin: 0px; }
    .loading-emoji {
      position: fixed;
      top: 20px;
      left: 20px;
      width: 10em;
      padding: 20px;
      background-color: #333;
      color: #fff;
      z-index: 9999999999999;
    }
  </style>`);
});

