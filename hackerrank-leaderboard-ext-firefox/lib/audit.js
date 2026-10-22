// audit.js — runs in popup context (not injected). <=200 lines.
// LULUS_UTUH = minimal 1 soal Accepted + semua testcase lolos + skor maksimum.
// Bobot soal = skor submission lolos-utuh. Selisih = bobot - diperoleh.
function auditStudent(bestList) {
  var full = 0, review = 0, flags = [];
  for (var i = 0; i < bestList.length; i++) {
    var s = bestList[i];
    var label = s.challenge_slug || s.challenge || "soal";
    if (isFullSolved(s)) full++;
    else if (isAccepted(s)) review++;
    var f = flagCode(s.code || "", s.language || "");
    if (f === "TANPA_KODE" && (s.tc_total > 0 || isAccepted(s))) {
      f = "KODE_GAGAL_DIAMBIL";
    }
    if (f) flags.push(label + ":" + f);
    if (isSampleOnly(s)) flags.push(label + ":SEBAGIAN_TC_LOLOS");
  }
  var status = full >= 1 ? "LULUS_UTUH" :
    review >= 1 ? "PERLU_REVIEW_MANUAL" : "BELUM_LULUS";
  return { full_solved_count: full, review_count: review,
    status: status, flags: flags };
}
function isFullSolved(s) {
  if (!isAccepted(s)) return false;
  var max = Number(s.max_score), score = Number(s.score);
  if (!(max > 0) || !(score >= max)) return false;
  var total = Number(s.tc_total), passed = Number(s.tc_passed);
  if (total > 0 && passed !== total) return false;
  return true;
}
function isAccepted(s) {
  return (s.status || "").toLowerCase().indexOf("accept") >= 0;
}
function isSampleOnly(s) {
  return s.tc_total > 0 && s.tc_passed > 0 && s.tc_passed < s.tc_total &&
    (s.status || "").toLowerCase().indexOf("wrong") >= 0;
}
function flagCode(code, lang) {
  if (!code) return "TANPA_KODE";
  var lines = code.split("\n");
  var real = 0;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].trim()) real++;
  }
  if (real < 8) return "KODE_SANGAT_PENDEK";
  var low = code.toLowerCase();
  var hasPrint = low.indexOf("print") >= 0 || low.indexOf("console.log") >= 0 ||
    low.indexOf("printf") >= 0 || low.indexOf("cout") >= 0 ||
    low.indexOf("system.out") >= 0;
  var hasLogic = low.indexOf("for") >= 0 || low.indexOf("while") >= 0 ||
    low.indexOf("if") >= 0 || low.indexOf("def ") >= 0 ||
    low.indexOf("function") >= 0 || low.indexOf("return") >= 0;
  if (hasPrint && !hasLogic) return "HANYA_PRINT";
  return "";
}
