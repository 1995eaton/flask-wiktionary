var input, cur, suggestions, definition;
var suggestArr = [];
var suggestIndex;
var finished;

hideSuggestions = function() {
  suggestArr.length = 0;
  suggestions.innerHTML = "";
};

onInput = function(e) {
  finished = false;
  if (e.which === 9 && !e.ctrlKey && !e.altKey && !e.metaKey && suggestArr.length > 0 && document.activeElement === input) {
    e.preventDefault();
    if (e.shiftKey) {
      if (suggestIndex !== undefined) {
        suggestArr[suggestIndex].style.backgroundColor = "";
        if (suggestIndex === 0) {
          suggestIndex = suggestArr.length - 1;
        } else suggestIndex--;
      } else suggestIndex = 0;
      suggestArr[suggestIndex].style.backgroundColor = "#fff";
    } else {
      if (suggestIndex !== undefined) {
        suggestArr[suggestIndex].style.backgroundColor = "";
        if (suggestIndex + 1 === suggestArr.length) {
          suggestIndex = 0;
        } else suggestIndex++;
      } else suggestIndex = 0;
      if (finished) hideSuggestions();
      suggestArr[suggestIndex].style.backgroundColor = "#fff";
    }
    return input.value = suggestArr[suggestIndex].innerText;
  }
  if (e.which === 13) {
    finished = true;
    hideSuggestions();
  }
  if (e.which < 38 && e.which !== 8) return;
  setTimeout(function() {
    if (input.value === cur || input.value.trim() === "") return suggestions.innerHTML = "";
    cur = input.value;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api");
    var form = new FormData();
    form.append("query", cur);
    form.append("type", "suggest");
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        suggestions.innerHTML = "";
        if (xhr.responseText.trim() !== "") {
          var t = xhr.responseText.split(", ");
          suggestArr = [];
          suggestIndex = undefined;
          for (var i = 0, l = t.length; i < l; i++) {
            if (t[i].trim() === "") continue;
            var temp = document.createElement("div");
            temp.className = "suggestion";
            temp.innerText = t[i];
            suggestArr.push(temp);
            suggestions.appendChild(temp);
          }
        }
      }
      if (finished) hideSuggestions();
    };
    xhr.send(form);
  }, 0);
};

send = function(custom) {
  if (!custom) {
    if (input.value.trim() === "") return;
    var search = input.value.trimLeft().trimRight();
    input.value = "";
  }
  function getData(dat) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api");
    var form = new FormData();
    form.append("query", dat);
    form.append("type", "query");
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        if (xhr.responseText.trim() !== "") {
          var tmp = xhr.responseText.replace(/\n+/g, "");
          tmp = tmp.split(/#/g).join("<br>");
          var m = tmp.match(/{{([^}]+)}}/g);
          if (m) {
            for (var i = 0, l = m.length; i < l; i++) {
              var cur = m[i];
              cur = cur.split("|").join(", ");
              cur = cur.replace(/(,)?(\s+)?(=en|(\|)?lang=en)(,)?(\s+)?/, "").replace(/=/g, " ");
              cur = "(" + cur.link("#" + cur.replace(/^\(|\)$/g, "")) + ")";
              tmp = tmp.replace(m[i], cur);
            }
          }
          var m = tmp.match(/\[\[([^\]]+)\]\]/g);
          if (m) {
            for (var i = 0, l = m.length; i < l; i++) {
              if (m[i].trim() === "") continue;
              var cur = m[i];
              cur = cur.replace(/\[\[/, "").replace(/\]\]/, "");
              cur = "<a href='#'>" + cur + "</a>";
              tmp = tmp.replace(m[i], cur);
            }
          }
          tmp = tmp.replace(/\|([a-zA-Z-]+)/g, "");
          tmp = tmp.replace(/{{|}}/g, "");
          tmp = tmp.replace(/^(<br>)+/, "");
          definition.innerHTML = tmp;
          definition.style.display = "block";
        }
      }
    };
    xhr.send(form);
  }
  if (custom) {
    getData(decodeURIComponent(custom));
  } else {
    getData(search);
  }
};

var onMouseDown = function(e) {
  if (e.target.nodeName === "A") {
    input.value = e.target.innerText;
    send();
  }
};

document.addEventListener("DOMContentLoaded", function() {
  if (/q=/.test(document.URL)) {
    send(document.URL.replace(/.*q=/, ""));
  }
  input = document.getElementById("input");
  definition = document.getElementById("definition");
  suggestions = document.getElementById("suggestions");
  suggestions.style.zIndex = "999";
  document.addEventListener("mousedown", onMouseDown, false);
  input.focus();
  input.addEventListener("keydown", onInput, false);
}, false);
