// ui.js — popup DOM helpers. <=200 lines.
function uiSetStatus(el, state) {
  var labels = { ready: "Ready", loading: "Loading...",
    error: "Error", done: "Done" };
  el.textContent = labels[state] || state;
  el.className = "badge " + state;
}
function uiSetBtn(btn, btnText, btnIcon, loading, label) {
  btn.disabled = loading;
  btn.className = loading ? "btn-scrape loading" : "btn-scrape";
  btnText.textContent = label;
  btnIcon.innerHTML = loading
    ? '<svg class="spin" width="16" height="16" viewBox="0 0 24 24" ' +
      'fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" ' +
      'stroke-width="2" stroke-opacity="0.3"/><path d="M12 2a10 10 0 0 1 ' +
      '10 10" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none">' +
      '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 ' +
      '5-5M12 15V3" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function uiLog(logArea, type, message) {
  var only = logArea.querySelector(".log-entry.info:only-child");
  if (only && only.textContent.indexOf("Buka halaman") >= 0) logArea.innerHTML = "";
  var entry = document.createElement("div");
  entry.className = "log-entry " + type;
  var dot = document.createElement("span");
  dot.className = "log-dot";
  var txt = document.createElement("span");
  txt.textContent = message;
  entry.appendChild(dot);
  entry.appendChild(txt);
  logArea.appendChild(entry);
  logArea.scrollTop = logArea.scrollHeight;
}
