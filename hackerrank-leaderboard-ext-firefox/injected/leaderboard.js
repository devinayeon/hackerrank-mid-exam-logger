// runLeaderboardScraper — injected via scripting.executeScript.
// Self-contained: no imports, no外 globals. Keep <=200 lines.
async function runLeaderboardScraper(contestSlug, limit, wantRealName) {
  try {
    var prefix = contestSlug || "global";
    var models = [];
    var offset = 0;
    var pageSize = 100;
    while (models.length < limit) {
      var batch = Math.min(pageSize, limit - models.length);
      var url = contestSlug
        ? "https://www.hackerrank.com/rest/contests/" + contestSlug +
          "/leaderboard?offset=" + offset + "&limit=" + batch
        : "https://www.hackerrank.com/rest/leaderboard?offset=" +
          offset + "&limit=" + batch;
      var res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status + ": " + res.statusText);
      var data = await res.json();
      var rows = data.models || [];
      if (!rows.length) break;
      for (var k = 0; k < rows.length; k++) models.push(rows[k]);
      offset += rows.length;
      if (rows.length < batch) break;
    }
    if (!models.length) {
      return { error: "Tidak ada peserta. Pastikan sudah login.", count: 0 };
    }
    var out = new Array(models.length);
    if (wantRealName) {
      var conc = 8, idx = 0;
      var worker = async function () {
        while (idx < models.length) {
          var i = idx++;
          var item = models[i];
          var real = item.hacker;
          try {
            var pr = await fetch(
              "https://www.hackerrank.com/rest/hackers/" + item.hacker);
            if (pr.ok) {
              var pd = await pr.json();
              if (pd.model && pd.model.name) real = pd.model.name;
            }
          } catch (_) {}
          var e = { rank: item.rank, username: item.hacker,
            real_name: real, score: item.score };
          if (item.time_taken !== undefined) e.time_taken = item.time_taken;
          out[i] = e;
        }
      };
      var n = Math.min(conc, models.length), ws = [];
      for (var w = 0; w < n; w++) ws.push(worker());
      await Promise.all(ws);
    } else {
      for (var j = 0; j < models.length; j++) {
        var m = models[j];
        var en = { rank: m.rank, username: m.hacker,
          real_name: m.hacker, score: m.score };
        if (m.time_taken !== undefined) en.time_taken = m.time_taken;
        out[j] = en;
      }
    }
    return { count: out.length,
      filename: prefix + "_leaderboard_clean.json",
      jsonString: JSON.stringify(out, null, 2) };
  } catch (err) {
    return { error: err.message };
  }
}
