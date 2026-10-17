// runSubmissionScraper — injected via scripting.executeScript.
// Judge endpoint + bobot soal + detail hemat (hanya kandidat best).
// Self-contained, <=200 lines.
async function runSubmissionScraper(contestSlug, hackers, opts) {
  opts = opts || {};
  var chalFilter = (opts.challengeFilter || "").toLowerCase();
  var wantCode = opts.includeCode !== false;
  try {
    if (!contestSlug) return { error: "Mode submission butuh halaman kontes (buka URL /contests/<nama-kontes>/...)." };
    var list = hackers && hackers.length ? hackers : [];
    if (!list.length) {
      var lr = await fetch(
        "https://www.hackerrank.com/rest/contests/" + contestSlug +
        "/leaderboard?offset=0&limit=" + (opts.limit || 100));
      if (!lr.ok) throw new Error("Leaderboard HTTP " + lr.status);
      var ms = (await lr.json()).models || [];
      for (var q = 0; q < ms.length; q++) list.push(ms[q].hacker);
    }
    var all = await listAllSubs(contestSlug, opts.cap || 3000);
    if (!all.length) {
      return { error: "Endpoint judge tak memberi data. Buka halaman kontes sebagai admin (tab /judge/submissions terlihat) lalu ulangi." };
    }
    var weights = await challengeWeights(contestSlug, all);
    var byUser = {};
    for (var g = 0; g < all.length; g++) {
      var key = ownerKey(all[g]);
      if (!byUser[key]) byUser[key] = [];
      byUser[key].push(all[g]);
    }
    var conc = 1, hi = 0;
    async function oneHacker(h) {
      var mine = byUser[String(h).toLowerCase()] || [];
      var per = [], seen = {};
      for (var s = 0; s < mine.length; s++) {
        var det = baseOf(mine[s]);
        if (chalFilter && det.challenge.toLowerCase().indexOf(chalFilter) < 0 &&
          det.challenge_slug.toLowerCase().indexOf(chalFilter) < 0) continue;
        var k = det.challenge_slug || det.challenge || det.id;
        if (!seen[k] || det.score > seen[k].score) seen[k] = det;
        per.push(det);
      }
      var best = [];
      for (var b in seen) best.push(seen[b]);
      for (var d = 0; d < best.length; d++) {
        await fillDetail(contestSlug, best[d], wantCode, weights);
      }
      return { username: h, submissions: per, best_per_challenge: best,
        submission_count_total: all.length,
        submission_count_mine: mine.length };
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
        generated_at: new Date().toISOString(),
        submission_total_visible: all.length,
        challenge_weights: weights, students: students }, null, 2) };
  } catch (err) { return { error: err.message }; }

  var lastStatus = 0;
  async function getJson(url) {
    var r = await fetch(url);
    lastStatus = r.status;
    if (!r.ok) return null;
    try { return await r.json(); } catch (_) { return null; }
  }
  async function listAllSubs(slug, cap) {
    var bases = ["/rest/contests/" + slug + "/judge_submissions/",
      "/rest/contests/" + slug + "/submissions"];
    for (var b = 0; b < bases.length; b++) {
      var all = [], off = 0;
      while (all.length < cap) {
        var n = Math.min(100, cap - all.length);
        var d = await getJson("https://www.hackerrank.com" + bases[b] + "?offset=" + off + "&limit=" + n);
        var arr = d && (d.models || d.submissions || d.data || d.results);
        if (!arr || !arr.length) break;
        for (var i = 0; i < arr.length; i++) all.push(arr[i]);
        off += arr.length; if (arr.length < n) break;
      }
      if (all.length) return all;
    }
    return [];
  }
  async function challengeWeights(slug, arr) {
    var map = {}, i;
    for (i = 0; i < arr.length; i++) {
      var p = parseTc(arr[i].testcase_message || arr[i].testcase_results || []);
      if (p[1] > 0 && p[0] === p[1]) setMax(map, arr[i], num(arr[i].score));
    }
    var d = await getJson("https://www.hackerrank.com/rest/contests/" + slug + "/challenges?offset=0&limit=100");
    var list = d && (d.models || d.challenges || d.data) || [];
    for (i = 0; i < list.length; i++) {
      var c = list[i];
      setMax(map, c, num(c.max_score, num(c.max_points,
        num(c.points, num(c.score, 0)))));
    }
    return map;
  }
  function setMax(map, s, mx) {
    var ch = s.challenge || {};
    var sl = s.slug || s.challenge_slug || ch.slug || "";
    if (sl && mx > 0 && (!map[sl] || mx > map[sl].max_score)) map[sl] = { name: s.challenge_name || s.name || s.title || ch.name || sl, max_score: mx };
  }
  function ownerKey(s) {
    var o = s.hacker_username || s.username;
    if (o) return String(o).toLowerCase();
    return "id:" + String(s.hacker_id === undefined ? "" : s.hacker_id);
  }
  function chalOf(s) {
    var c = s.challenge;
    if (c && typeof c === "object") {
      return { name: c.name || c.title || "",
        slug: c.slug || c.challenge_slug || "" };
    }
    return { name: s.challenge_name || (typeof c === "string" ? c : ""),
      slug: s.challenge_slug || s.slug || "" };
  }
  function toIso(v) {
    if (v === undefined || v === null || v === "") return "";
    return typeof v !== "number" ? String(v) : new Date(v < 1e12 ? v * 1000 : v).toISOString();
  }
  function baseOf(s) {
    var ch = chalOf(s);
    var tc = s.testcase_message || s.testcase_results || s.test_cases;
    var pr = tc ? parseTc(tc) : [-1, -1];
    return { id: s.id || s.submission_id || s.submissionId,
      challenge: ch.name || ch.slug || "",
      challenge_slug: ch.slug || ch.name || "",
      language: s.language || "", code: "", score: num(s.score),
      max_score: num(s.max_score, s.maxScore !== undefined ? num(s.maxScore) : 0),
      status: s.status || "",
      submitted_at: toIso(s.created_at || s.submitted_at),
      tc_passed: pr[0], tc_total: pr[1] };
  }
  async function attempt(path) {
    var waits = [1500, 5000, 15000], d = null;
    for (var t = 0; t <= waits.length; t++) {
      if (t > 0) await new Promise(function (x) { setTimeout(x, waits[t - 1]); });
      d = await getJson("https://www.hackerrank.com" + path);
      if (d || lastStatus !== 429) break;
    }
    return d;
  }
  async function fillDetail(slug, det, wantCode, weights) {
    var w = weights[det.challenge_slug];
    if (det.max_score === 0 && w && w.max_score > 0) det.max_score = w.max_score;
    det.selisih = det.max_score > 0 ? det.max_score - det.score : null;
    if (!wantCode || !det.id) return;
    det.code_errors = [];
    var d = await attempt("/rest/contests/" + slug + "/submissions/" + det.id);
    det.code_errors.push(lastStatus);
    var m = d && (d.model || d.submission || d);
    if (m && (m.code || m.solution || m.source)) det.code = m.code || m.solution || m.source;
    var tc = m && (m.testcase_message || m.testcase_results);
    if (tc) { var p = parseTc(tc); det.tc_passed = p[0]; det.tc_total = p[1]; }
    if (m && m.display_score !== undefined) det.score = num(m.display_score);
    await new Promise(function (x) { setTimeout(x, 1200); });
    if (det.code) delete det.code_errors;
  }
  function parseTc(tc) {
    if (typeof tc === "object" && tc.passed !== undefined) {
      return [num(tc.passed), num(tc.total)];
    }
    if (!tc.length) return [-1, -1];
    if (typeof tc[0] === "string") {
      var ok = 0;
      for (var j = 0; j < tc.length; j++) {
        if (tc[j].toLowerCase() === "success") ok++;
      }
      return [ok, tc.length];
    }
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
