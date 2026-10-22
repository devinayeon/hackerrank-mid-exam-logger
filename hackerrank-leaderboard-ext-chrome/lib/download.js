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
function csvCell(v) {
  var s = String(v === undefined || v === null ? "" : v);
  if (/^[=+\-@\t\r\n\uFF1D\uFF0B\uFF0D\uFF20]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}
function toRecapCsv(rows, order) {
  order = order || [];
  var head = ["username", "real_name", "total_score"];
  for (var c = 0; c < order.length; c++) head.push("aktual_" + order[c]);
  head.push("total_possible", "selisih_total", "soal_utuh_lulus",
    "soal_dikerjakan", "flags", "status");
  var out = [head.map(csvCell).join(",")];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i], cells = [r.username, r.real_name, r.total_score];
    for (var k = 0; k < order.length; k++) {
      var v = r.scores ? r.scores[order[k]] : undefined;
      cells.push(v === undefined ? 0 : v);
    }
    cells.push(r.total_possible, r.selisih_total, r.full_solved,
      r.challenge_count, r.flags.join("|"), r.status);
    out.push(cells.map(csvCell).join(","));
  }
  return out.join("\r\n");
}
