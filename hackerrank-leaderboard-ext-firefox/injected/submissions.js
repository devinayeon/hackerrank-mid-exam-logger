// runSubmissionScraper — injected via scripting.executeScript.
// Self-contained (no imports). Mencoba beberapa pola endpoint REST
// HackerRank karena shape API beda antar kontes/peran login.
// Mengembalikan kode + testcase + poin per mahasiswa untuk audit.
async function runSubmissionScraper(contestSlug, hackers, opts) {
  opts = opts || {};
  var maxPer = opts.maxPerStudent || 20;
  var chalFilter = (opts.challengeFilter || "").toLowerCase();
  var wantCode = opts.includeCode !== false;
  try {
    if (!contestSlug) return { error: "Mode submission butuh halaman kontes." };
    var list = hackers && hackers.length ? hackers : [];
    if (!list.length) {
      var lr = await fetch(
        "https://www.hackerrank.com/rest/contests/" + contestSlug +
        "/leaderboard?offset=0&limit=" + (opts.limit || 100));
      if (!lr.ok) throw new Error("Leaderboard HTTP " + lr.status);
      var ld = await lr.json();
      var ms = ld.models || [];
      for (var q = 0; q < ms.length; q++) list.push(ms[q].hacker);
    }
    var out = [];
    var conc = 4, hi = 0;
    async function oneHacker(h) {
      var subs = await listSubs(contestSlug, h, maxPer);
      var per = [];
      var seen = {};
      for (var s = 0; s < subs.length; s++) {
        var det = await detailSub(contestSlug, subs[s], wantCode);
        if (chalFilter && det.challenge.toLowerCase().indexOf(chalFilter) < 0) {
          if (det.challenge_slug.toLowerCase().indexOf(chalFilter) < 0) continue;
        }
        var key = det.challenge_slug || det.challenge;
        if (!seen[key] || det.score > seen[key].score) seen[key] = det;
        per.push(det);
      }
      var best = [];
      for (var k in seen) best.push(seen[k]);
      return { username: h, submissions: per, best_per_challenge: best };
    }
    var res = new Array(list.length), errs = [];
    async function worker() {
      while (hi < list.length) {
        var i = hi++;
        try { res[i] = await oneHacker(list[i]); }
        catch (e) { errs.push(list[i] + ": " + e.message); res[i] = null; }
      }
    }
    var ws = [], nw = Math.min(conc, list.length);
    for (var w = 0; w < nw; w++) ws.push(worker());
    await Promise.all(ws);
    var students = [];
    for (var r = 0; r < res.length; r++) if (res[r]) students.push(res[r]);
    return { count: students.length, errors: errs,
      filename: contestSlug + "_submissions_audit.json",
      jsonString: JSON.stringify({ contest: contestSlug,
        generated_at: new Date().toISOString(), students: students }, null, 2) };
  } catch (err) { return { error: err.message }; }

  async function getJson(url) {
    var r = await fetch(url);
    if (!r.ok) return null;
    try { return await r.json(); } catch (_) { return null; }
  }
  async function listSubs(slug, hacker, lim) {
    var urls = [
      "/rest/contests/" + slug + "/submissions?hacker=" + hacker +
        "&offset=0&limit=" + lim,
      "/rest/contests/" + slug + "/submissions?username=" + hacker +
        "&offset=0&limit=" + lim,
      "/rest/submissions?contest_slug=" + slug + "&hacker=" + hacker +
        "&offset=0&limit=" + lim,
      "/rest/hackers/" + hacker + "/submissions?contest_slug=" + slug +
        "&offset=0&limit=" + lim
    ];
    for (var i = 0; i < urls.length; i++) {
      var d = await getJson("https://www.hackerrank.com" + urls[i]);
      var arr = d && (d.models || d.submissions || d.data || d.results);
      if (arr && arr.length) return arr;
    }
    return [];
  }
  async function detailSub(slug, s, wantCode) {
    var id = s.id || s.submission_id || s.submissionId;
    var base = { challenge: s.challenge_name || s.challenge || s.slug || "",
      challenge_slug: s.challenge_slug || s.slug || "",
      language: s.language || "", code: wantCode ? (s.code || s.solution ||
        s.source || "") : "", score: num(s.score), max_score: num(s.max_score),
      status: s.status || "", submitted_at: s.created_at || s.createdAt || "" };
    if (!base.challenge) base.challenge = base.challenge_slug || String(id || "");
    if (id) {
      var urls = ["/rest/contests/" + slug + "/submissions/" + id,
        "/rest/submissions/" + id];
      for (var i = 0; i < urls.length; i++) {
        var d = await getJson("https://www.hackerrank.com" + urls[i]);
        var m = d && (d.model || d.submission || d);
        if (!m || typeof m !== "object") continue;
        if (m.code || m.solution || m.source) {
          base.code = wantCode ? (m.code || m.solution || m.source) : "";
        }
        if (m.language) base.language = m.language;
        if (m.score !== undefined) base.score = num(m.score);
        if (m.max_score !== undefined) base.max_score = num(m.max_score);
        if (m.status) base.status = m.status;
        var tc = m.testcase_results || m.test_cases || m.testcases ||
          m.results || m.test_case_results;
        if (tc) { var p = parseTc(tc); base.tc_passed = p[0]; base.tc_total = p[1]; }
        if (base.code || base.tc_total) break;
      }
    }
    if (base.tc_total === undefined) {
      var tc2 = s.testcase_results || s.test_cases || s.results;
      if (tc2) { var q = parseTc(tc2); base.tc_passed = q[0]; base.tc_total = q[1]; }
      else {
        base.tc_passed = num(s.testcases_passed, -1);
        base.tc_total = num(s.testcases_total, -1);
      }
    }
    if (base.max_score === 0 && s.maxScore !== undefined) {
      base.max_score = num(s.maxScore);
    }
    return base;
  }
  function parseTc(tc) {
    if (typeof tc === "object" && tc.passed !== undefined) {
      return [num(tc.passed), num(tc.total)];
    }
    if (!tc.length) return [-1, -1];
    var p = 0;
    for (var i = 0; i < tc.length; i++) {
      var t = tc[i];
      if (t.passed === true || t.status === "Accepted" ||
        t.result === "pass" || t.success === true) p++;
    }
    return [p, tc.length];
  }
  function num(v, fb) {
    var n = Number(v);
    return isNaN(n) ? (fb === undefined ? 0 : fb) : n;
  }
}
