// report.js — bangun file laporan audit mandiri (HTML+CSS+JS inline).
// Pure string builder (testable di node). Budget <=200 baris.
function buildReportHtml(payload) {
  var data = JSON.stringify(payload).replace(/<\//g, "<\\/");
  var css = [
    ":root{color-scheme:light dark;--bg:#f2f2f7;--card:#ffffff;--line:#e5e5ea;",
    "--ink:#1c1c1e;--mut:#6e6e73;--acc:#0d9488;--acc-soft:#e6f4f2;}",
    "@media (prefers-color-scheme:dark){:root{--bg:#1c1c1e;--card:#2c2c2e;",
    "--line:#3a3a3c;--ink:#f2f2f7;--mut:#98989f;--acc:#2dd4bf;--acc-soft:#0b2e2a;}}",
    "*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);",
    "font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',Inter,system-ui,sans-serif;",
    "line-height:1.6}",
    ".skip{position:absolute;left:-999px}.skip:focus{left:8px;top:8px;background:var(--ink);",
    "color:var(--bg);padding:10px 16px;border-radius:10px}",
    "header{padding:28px 32px 12px}header h1{margin:0 0 6px;font-size:34px;",
    "font-weight:700;letter-spacing:-.02em;line-height:1.1}",
    ".meta{color:var(--mut);font-size:13px;display:flex;gap:16px;flex-wrap:wrap}",
    ".meta b{color:var(--ink);font-variant-numeric:tabular-nums}",
    ".wrap{display:grid;grid-template-columns:330px 1fr;gap:16px;",
    "padding:0 32px 32px;align-items:start}",
    "aside{background:var(--card);border:1px solid var(--line);border-radius:12px;",
    "padding:12px;display:flex;flex-direction:column;gap:8px}",
    ".sechead{font-size:12px;color:var(--mut);text-transform:uppercase;",
    "letter-spacing:.05em;font-weight:600;padding:4px 10px 0}",
    "label{font-size:11px;color:var(--mut);font-weight:600}",
    "input,select{background:var(--bg);border:1px solid var(--line);color:var(--ink);",
    "border-radius:10px;padding:9px 12px;font:inherit;font-size:16px;width:100%}",
    "input:focus-visible,select:focus-visible,button:focus-visible{outline:2px solid var(--acc);",
    "outline-offset:2px}",
    "#list{display:flex;flex-direction:column;overflow-y:auto;max-height:62vh;",
    "border:1px solid var(--line);border-radius:10px}",
    ".stu{display:flex;justify-content:space-between;gap:8px;align-items:center;",
    "background:transparent;border:0;border-top:1px solid var(--line);",
    "min-height:44px;padding:8px 6px 8px 12px;cursor:pointer;color:var(--ink);",
    "font:inherit;font-size:14px;text-align:left;width:100%}",
    ".stu:first-child{border-top:0}",
    ".stu:hover{background:var(--bg)}",
    ".stu:active{opacity:.55}",
    ".stu[aria-current=true]{background:var(--acc-soft)}",
    ".stu .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}",
    ".chev{color:var(--mut);font-size:16px;flex-shrink:0}",
    ".badge{font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;",
    "flex-shrink:0;white-space:nowrap}",
    ".LULUS_UTUH{background:#e6f4ea;color:#1a7f37}",
    ".PERLU_REVIEW_MANUAL{background:#fdf3d7;color:#8a6100}",
    ".BELUM_LULUS{background:#fce8e6;color:#b3261e}",
    "main{background:var(--card);border:1px solid var(--line);border-radius:12px;",
    "padding:24px 28px;animation:fade .18s ease-out}",
    "main h2{margin:0;font-size:26px;letter-spacing:-.01em}",
    "@keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}",
    "@media (prefers-reduced-motion:reduce){main{animation:none}}",
    ".ch{border-top:1px solid var(--line);padding:16px 0;margin:0}",
    ".ch h3{margin:0 0 6px;font-size:16px}",
    ".row{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--mut)}",
    ".row b{color:var(--ink);font-variant-numeric:tabular-nums}",
    "pre{background:var(--bg);border:1px solid var(--line);border-radius:8px;",
    "padding:14px;overflow:auto;max-height:340px;font-size:12px;color:var(--ink);",
    "line-height:1.6;font-family:ui-monospace,'SF Mono',Menlo,monospace}",
    ".copy{background:var(--acc);color:#fff;border:1px solid var(--acc);",
    "border-radius:999px;padding:8px 18px;font:inherit;font-size:13px;",
    "font-weight:600;cursor:pointer;min-height:44px}",
    ".empty{color:var(--mut);padding:24px;text-align:center}",
    "@media (max-width:760px){.wrap{grid-template-columns:1fr;padding:0 16px 16px}",
    "header{padding:20px 16px 8px}header h1{font-size:26px}}"
  ].join("\n");
  var js = [
    "'use strict';",
    "const P=JSON.parse(document.getElementById('d').textContent);",
    "const list=document.getElementById('list'),main=document.getElementById('main');",
    "const q=document.getElementById('q'),f=document.getElementById('f');",
    "const esc=s=>String(s??'').replace(/[&<>\\x22]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\x22':'&quot;'}[c]));",
    "const badge=s=>'<span class=\"badge '+s.audit.status+'\">'+s.audit.status.replace(/_/g,' ')+'</span>';",
    "const head=s=>'<h2>'+esc(s.real_name)+'</h2><p class=\"meta\"><span>@'+esc(s.username)+'</span>'+badge(s)+'</p>';",
    "const info=s=>{const a=s.audit;let h='<div class=\"row\"><span>Skor <b>'+s.total_score+'</b>'+(P.total_possible?' / '+P.total_possible:'')+'</span><span>Soal utuh <b>'+a.full_solved_count+'</b></span><span>Rank <b>'+(s.rank??'—')+'</b></span></div>';if(a.flags.length)h+='<div class=\"row\"><span>Flag: <b>'+a.flags.map(esc).join(' | ')+'</b></span></div>';return h};",
    "const card=b=>{let h='<section class=\"ch\"><h3>'+esc(b.challenge)+'</h3><div class=\"row\"><span>Skor <b>'+b.score+(b.max_score>0?' / '+b.max_score:'')+'</b>'+(b.selisih!=null&&b.max_score>0?' (selisih '+b.selisih+')':'')+'</span><span>Testcase <b>'+b.tc_passed+'/'+b.tc_total+'</b></span><span>Status <b>'+esc(b.status)+'</b></span><span>Bahasa <b>'+esc(b.language)+'</b></span></div>';h+=b.code?'<div><button class=\"copy\" data-c=\"'+b.id+'\">Salin kode</button><pre><code>'+esc(b.code)+'</code></pre></div>':'<p class=\"empty\">Kode tak tersedia (gagal diambil dari HackerRank).</p>';return h+'</section>'};",
    "const view=s=>{main.innerHTML=head(s)+info(s)+s.best_per_challenge.map(card).join('');main.querySelectorAll('.copy').forEach(x=>{x.onclick=()=>{const b=s.best_per_challenge.find(y=>String(y.id)===x.dataset.c);if(b)navigator.clipboard.writeText(b.code).then(()=>{x.textContent='Tersalin';setTimeout(()=>{x.textContent='Salin kode'},1200)})}})};",
    "const draw=()=>{const t=q.value.toLowerCase();list.innerHTML='';const rs=P.students.filter(s=>(!f.value||s.audit.status===f.value)&&(s.username+s.real_name).toLowerCase().includes(t));if(!rs.length){list.innerHTML='<p class=\"empty\">Tidak ada mahasiswa.</p>';return}rs.forEach((s,i)=>{const b=document.createElement('button');b.className='stu';b.setAttribute('aria-current',i===0);b.innerHTML='<span class=\"nm\">'+esc(s.real_name)+'</span><span>'+badge(s)+'<span class=\"chev\" aria-hidden=\"true\"> ›</span></span>';b.onclick=()=>{list.querySelectorAll('.stu').forEach(x=>x.setAttribute('aria-current',false));b.setAttribute('aria-current',true);view(s)};list.appendChild(b)});view(rs[0])};",
    "q.oninput=draw;f.onchange=draw;draw();"
  ].join("\n");
  var nL = payload.students.filter(function (s) {
    return s.audit.status === "LULUS_UTUH";
  }).length;
  return "<!DOCTYPE html><html lang=\"id\"><head><meta charset=\"UTF-8\">" +
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
    "<meta name=\"theme-color\" media=\"(prefers-color-scheme: light)\" content=\"#f2f2f7\">" +
    "<meta name=\"theme-color\" media=\"(prefers-color-scheme: dark)\" content=\"#1c1c1e\">" +
    "<title>Laporan Audit " + escHtml(payload.contest) + "</title>" +
    "<style>" + css + "</style></head><body>" +
    "<a class=\"skip\" href=\"#main\">Lewati ke hasil</a>" +
    "<header>" +
    "<h1>Laporan Audit " + escHtml(payload.contest) + "</h1>" +
    "<div class=\"meta\"><span>Peserta <b>" + payload.students.length +
    "</b></span><span>Lulus utuh <b>" + nL + "</b></span>" +
    "<span>Total submission <b>" + payload.submission_total_visible +
    "</b></span><span>Dibuat <b>" + escHtml(payload.generated_at) +
    "</b></span></div></header>" +
    "<div class=\"wrap\"><aside><label for=\"q\">Cari mahasiswa</label>" +
    "<input id=\"q\" type=\"search\" autocomplete=\"off\" " +
    "placeholder=\"nama atau username…\">" +
    "<label for=\"f\">Status</label><select id=\"f\">" +
    "<option value=\"\">Semua</option><option>LULUS_UTUH</option>" +
    "<option>PERLU_REVIEW_MANUAL</option><option>BELUM_LULUS</option>" +
    "</select><div class=\"sechead\">Mahasiswa</div>" +
    "<div id=\"list\" aria-live=\"polite\"></div></aside>" +
    "<main id=\"main\" tabindex=\"-1\"></main></div>" +
    "<script id=\"d\" type=\"application/json\">" + data + "</scr" + "ipt>" +
    "<script>" + js + "</scr" + "ipt></body></html>";
}
function escHtml(v) {
  return String(v === undefined ? "" : v).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}
