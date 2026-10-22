// popup.js — orchestrator UI. Delegates to injected/* + lib/*. <=200 lines.
var ext = typeof browser !== "undefined" ? browser : chrome;
document.addEventListener("DOMContentLoaded", async function () {
  var btn = document.getElementById("btnScrape");
  var btnText = document.getElementById("btnText");
  var btnIcon = btn.querySelector(".btn-icon");
  var badge = document.getElementById("statusBadge");
  var pageType = document.getElementById("pageType");
  var contestEl = document.getElementById("contestName");
  var logArea = document.getElementById("logArea");
  var progArea = document.getElementById("progressArea");
  var progBar = document.getElementById("progressBar");
  var progText = document.getElementById("progressText");
  var limitSel = document.getElementById("limitSelect");
  var wantName = document.getElementById("fetchRealName");
  var modeSel = document.getElementById("modeSelect");
  var chalFilter = document.getElementById("challengeFilter");
  var wantCode = document.getElementById("includeCode");
  var tab = null, slug = null, isHR = false;
  try {
    var tabs = await ext.tabs.query({ active: true, currentWindow: true });
    tab = tabs[0];
    if (tab && tab.url && tab.url.indexOf("hackerrank.com") >= 0) {
      isHR = true;
      var segs = new URL(tab.url).pathname.split("/").filter(Boolean);
      if (segs.indexOf("contests") >= 0) {
        slug = segs[segs.indexOf("contests") + 1] || null;
        pageType.textContent = "Contest Page";
        contestEl.textContent = slug ? slug.replace(/-/g, " ") : "(no slug)";
      } else { pageType.textContent = "Global / Profile"; contestEl.textContent = "-"; }
      btn.disabled = false;
      uiSetStatus(badge, "ready");
    } else {
      pageType.textContent = "Bukan HackerRank";
      uiSetStatus(badge, "error");
      uiLog(logArea, "warn", "Buka halaman HackerRank dulu.");
    }
  } catch (e) { uiLog(logArea, "error", "Gagal baca tab: " + e.message); }
  btn.addEventListener("click", async function () {
    if (!isHR || !tab) return;
    var scripting = ext.scripting ||
      (typeof chrome !== "undefined" ? chrome.scripting : null);
    if (!scripting) { uiLog(logArea, "error", "API scripting tak tersedia."); return; }
    var limit = parseInt(limitSel.value, 10);
    uiSetBtn(btn, btnText, btnIcon, true, "Memproses...");
    uiSetStatus(badge, "loading");
    logArea.innerHTML = "";
    progArea.style.display = "flex";
    try {
      if (modeSel.value === "leaderboard") await runLeaderboard(scripting, limit);
      else await runSubmissions(scripting, limit);
    } catch (e) { uiLog(logArea, "error", "Error: " + e.message); }
    uiSetBtn(btn, btnText, btnIcon, false, "Download");
  });
  async function runLeaderboard(scripting, limit) {
    progBar.style.width = "10%";
    progText.textContent = "Menghubungkan ke API HackerRank...";
    var r = await scripting.executeScript({ target: { tabId: tab.id },
      func: runLeaderboardScraper, args: [slug, limit, wantName.checked] });
    var d = r[0].result;
    if (d.error) { uiLog(logArea, "error", d.error); uiSetStatus(badge, "error"); return; }
    progBar.style.width = "100%";
    uiLog(logArea, "success", "Scrape " + d.count + " peserta.");
    await scripting.executeScript({ target: { tabId: tab.id },
      func: triggerDownload, args: [d.jsonString, d.filename] });
    uiSetStatus(badge, "done");
  }
  async function runSubmissions(scripting, limit) {
    progText.textContent = "Ambil leaderboard + submission per peserta...";
    var lb = await scripting.executeScript({ target: { tabId: tab.id },
      func: runLeaderboardScraper,
      args: [slug, limit, wantName.checked] });
    if (lb[0].result.error) { uiLog(logArea, "error", lb[0].result.error); return; }
    var rows = JSON.parse(lb[0].result.jsonString);
    var hackers = rows.map(function (x) { return x.username; });
    var names = {};
    rows.forEach(function (x) { names[x.username] = x; });
    progBar.style.width = "30%";
    var sr = await scripting.executeScript({ target: { tabId: tab.id },
      func: runSubmissionScraper,
      args: [slug, hackers, { limit: limit, maxPerStudent: 20,
        challengeFilter: chalFilter.value || "",
        includeCode: wantCode.checked }] });
    var sd = sr[0].result;
    if (sd.error) { uiLog(logArea, "error", sd.error); return; }
    var payload = JSON.parse(sd.jsonString);
    var weights = payload.challenge_weights || {};
    var totalPossible = 0;
    Object.keys(weights).forEach(function (k) {
      totalPossible += weights[k].max_score || 0;
    });
    var order = Object.keys(weights);
    var recap = payload.students.map(function (s) {
      var base = names[s.username] || {};
      var au = auditStudent(s.best_per_challenge || []);
      s.audit = au;
      s.real_name = base.real_name || s.username;
      s.rank = base.rank;
      s.total_score = base.score;
      var obtained = base.score || 0;
      var scores = {};
      (s.best_per_challenge || []).forEach(function (b) {
        scores[b.challenge_slug || b.challenge] = b.score;
      });
      return { username: s.username, real_name: s.real_name,
        total_score: obtained, total_possible: totalPossible,
        selisih_total: totalPossible > 0 ? totalPossible - obtained : "",
        scores: scores, full_solved: au.full_solved_count,
        challenge_count: (s.best_per_challenge || []).length,
        flags: au.flags, status: au.status };
    });
    payload.total_possible = totalPossible;
    payload.audit_rule = "LULUS_UTUH = minimal 1 soal Accepted " +
      "(semua testcase termasuk hidden lolos) DAN skor maksimum soal. " +
      "Bobot soal = skor saat diselesaikan utuh; selisih = bobot - skor diperoleh.";
    progBar.style.width = "90%";
    await scripting.executeScript({ target: { tabId: tab.id },
      func: triggerDownload,
      args: [JSON.stringify(payload, null, 2), sd.filename] });
    downloadText(toRecapCsv(recap, order),
      (slug || "global") + "_rekap_audit.csv", "text/csv");
    var n = recap.filter(function (x) { return x.status === "LULUS_UTUH"; }).length;
    progBar.style.width = "100%";
    uiLog(logArea, "success", "Audit " + recap.length + " mahasiswa: " +
      n + " lulus utuh.");
    var errs = sd.errors || [];
    if (errs.length) uiLog(logArea, "warn", errs.length + " peserta gagal " +
      "diambil kodenya (lihat code_errors di JSON).");
    uiSetStatus(badge, "done");
  }
});
