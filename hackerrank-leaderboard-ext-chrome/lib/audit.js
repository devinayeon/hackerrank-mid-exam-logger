// audit.js — runs in popup context (not injected). <=200 lines.
function auditStudent(bestList) {
  var full = 0, flags = [];
  for (var i = 0; i < bestList.length; i++) {
    var s = bestList[i];
    var solved = isFullSolved(s);
    if (solved) full++;
    var f = flagCode(s.code || "", s.language || "");
    if (f && !solved) flags.push(s.challenge + ":" + f);
    else if (f) flags.push(s.challenge + ":" + f);
    if (isSampleOnly(s)) flags.push(s.challenge + ":SAMPLE_ONLY?");
  }
  return { full_solved_count: full,
    status: full >= 1 ? "LULUS_UTUH" : "BELUM_LULUS", flags: flags };
}
function isFullSolved(s) {
  if (s.tc_total > 0) {
    if (s.tc_passed === s.tc_total) return true;
    return false;
  }
  if (s.max_score > 0) return s.score >= s.max_score;
  var st = (s.status || "").toLowerCase();
  return st.indexOf("accept") >= 0;
}
function isSampleOnly(s) {
  return s.tc_total > 0 && s.tc_passed > 0 && s.tc_passed < s.tc_total &&
    (s.status || "").toLowerCase().indexOf("wrong") >= 0;
}
function flagCode(code, lang) {
  if (!code) return "NO_CODE";
  var lines = code.split("\n");
  var real = 0;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].trim()) real++;
  }
  if (real < 8) return "SHORT_CODE";
  var low = code.toLowerCase();
  var hasPrint = low.indexOf("print") >= 0 || low.indexOf("console.log") >= 0 ||
    low.indexOf("printf") >= 0 || low.indexOf("cout") >= 0 ||
    low.indexOf("system.out") >= 0;
  var hasLogic = low.indexOf("for") >= 0 || low.indexOf("while") >= 0 ||
    low.indexOf("if") >= 0 || low.indexOf("def ") >= 0 ||
    low.indexOf("function") >= 0 || low.indexOf("return") >= 0;
  if (hasPrint && !hasLogic) return "PRINT_ONLY";
  return "";
}
