// download.js — popup context helpers + injected trigger. <=200 lines.
function triggerDownload(jsonString, filename) {
  var blob = new Blob([jsonString], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
}
function downloadText(text, filename, mime) {
  var blob = new Blob([text], { type: mime || "text/plain" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
}
function toRecapCsv(rows) {
  var head = "username,real_name,total_score,soal_lulus_utuh," +
    "jumlah_soal,flags,status";
  var out = [head];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    out.push([q(r.username), q(r.real_name), r.total_score,
      r.full_solved, r.challenge_count, q(r.flags.join("|")),
      r.status].join(","));
  }
  return out.join("\n");
}
function q(v) {
  var s = String(v === undefined ? "" : v);
  if (s.indexOf(",") >= 0 || s.indexOf('"') >= 0) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
