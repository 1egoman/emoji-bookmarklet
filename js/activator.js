var xhr = new XMLHttpRequest();
xhr.open('GET', encodeURI("https:/weeklyhack.github.io/2-emoji/bundle.js"))
// xhr.open('GET', encodeURI("http://127.0.0.1:8000/bundle.js"))
xhr.onload = function() {
  if (xhr.status === 200) {
    var element = document.createElement("script");
    element.innerText = xhr.responseText;
    document.body.appendChild(element);
  } else {
    alert("Couldn't load script, returned "+xhr.status);
  }
};
xhr.send();
