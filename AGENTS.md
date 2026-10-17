# AGENTS.md — HackerRank Webscrapper (konteks untuk AI agent)

## 1. Konteks proyek

* Repo awal milik teman (`upstream`: `harmlessvalve1/hackerrank-webscrapper`, GitLab).
  Fork aktif: `origin` = `devinayeon/hackerrank-webscrapper`. Branch kerja: `main`.
* Pemilik memakai proyek ini sebagai **penguji UTS mata kuliah Algoritma dan
  Pemrograman** (mahasiswa Ilmu Komputer). Cek nilai manual satu per satu tidak
  mungkin, jadi extension men-scrape leaderboard + submission tiap peserta.
* Syarat kelulusan ujian: **minimal 1 soal diselesaikan secara utuh**, yaitu
  kode lolos **seluruh testcase termasuk hidden case** dan meraih **poin
  maksimum soal**. Akal-akalan `print` output (skor parsial tanpa logika) harus
  tertangkap.
* Dua varian extension yang wajib **selalu sinkron**: `hackerrank-leaderboard-ext-chrome/`
  (Chrome/Edge/Brave, `background.service_worker`) dan
  `hackerrank-leaderboard-ext-firefox/` (Firefox/Zen, `background.scripts` +
  `browser_specific_settings.gecko`). Bedakan hanya `manifest.json` (dan
  komentar `background.js`); semua file lain identik. Cara sinkron: ubah varian
  Chrome, lalu `Copy-Item` ke Firefox, lalu `node --check`.

## 2. Arsitektur dan alur data

```
popup.html (+ lib/ui.js, lib/audit.js, lib/download.js, lib/report.js,
             injected/leaderboard.js, injected/submissions.js, popup.js)
  -> popup.js deteksi tab + slug kontes dari URL
  -> mode "leaderboard": executeScript(runLeaderboardScraper)
     GET /rest/contests/{slug}/leaderboard?offset&limit (atau /rest/leaderboard)
     (+ GET /rest/hackers/{hacker} bila "Ambil Real Name")
     -> unduh {prefix}_leaderboard_clean.json [{rank, username, real_name, score, time_taken?}]
  -> mode "submission + audit":
     1. leaderboard dulu (daftar username + real_name + rank + score)
     2. executeScript(runSubmissionScraper):
        GET /rest/contests/{slug}/judge_submissions/?offset&limit (pagination s.d. habis;
          HARUS sebagai admin dengan tab /judge/submissions terlihat, kalau tidak hanya
          submission milik akun login yang kembali)
        -> kelompokkan per hacker_username di klien
        -> bobot soal (challenge_weights): resmi dari GET .../challenges (max_score),
           fallback = skor submission lolos-utuh tertinggi yang teramati
        -> best per challenge per mahasiswa (skor tertinggi), lalu detail-fetch kode
           HANYA untuk kandidat best: GET /rest/contests/{slug}/submissions/{id}
           (pola ini yang terbukti; judge_submissions/{id} 404)
        -> pacing anti-throttle: 1 worker, jeda 1.2 dtk, backoff 1.5/5/15 dtk khusus 429
     3. popup.js: auditStudent() per mahasiswa, bangun rekap CSV + laporan HTML
     -> unduh 3 file: {slug}_submissions_audit.json, {slug}_rekap_audit.csv,
        {slug}_laporan_audit.html
```

Fungsi `run*Scraper`/`triggerDownload` wajib **self-contained** (tanpa import):
mereka diserialisasi `scripting.executeScript({func})` ke konteks halaman dan
berjalan dengan cookie login penguji. `content.js`/`background.js` praktis
hiasan (hanya log + handler PING tanpa pengirim).

## 3. Bagaimana HTML keluar dan mengapa terhubung ke scraping

* `lib/report.js` mengekspor satu fungsi murni: `buildReportHtml(payload)` ->
  string HTML utuh. `popup.js` memanggilnya dengan `payload` JSON audit yang
  sama persis dengan yang diunduh, lalu `downloadText(..., "text/html")`.
  Jadi HTML, JSON, dan CSV **selalu konsisten** karena lahir dari objek yang sama.
* File mandiri: CSS + JS inline, **nol request eksternal** (teruji), data
  tertanam sebagai `<script type="application/json">` (tanda `<\/` di-escape).
* Alur pakai (sengaja minimal): daftar mahasiswa di kiri (cari nama +
  filter status) -> klik nama -> header status lengkap (skor/total, soal utuh,
  rank, flag) + kartu per soal UTS (skor/bobot, selisih, testcase, status,
  bahasa) + blok kode + tombol Salin kode.
* Desain mengikuti Apple HIG (font sistem, large title, inset grouped list,
  target sentuh 44px, terang+gelap) dengan filter anti-slop (tanpa gradien,
  glow, emoji, klaim fabrikasi; semua angka dari data nyata).

## 4. Mekanisme audit yang diinginkan pemilik

* `LULUS_UTUH` = minimal 1 soal `Accepted` (di HackerRank berarti semua
  testcase + hidden lolos). Tanpa bukti tc/maks → `PERLU_REVIEW_MANUAL`,
  bukan lulus. Tanpa itu semua → `BELUM_LULUS`.
* Bobot soal = skor saat diselesaikan utuh (contoh resmi kontes: Ejak 15,
  Layanan 20, Nilai 20, Rabbit 20, Segitiga 25; total 100). `selisih` =
  bobot − skor diperoleh, per soal dan per mahasiswa (`selisih_total`).
* CSV merinci total menjadi kolom `aktual_<slug>` per soal + `total_possible`,
  `selisih_total`, `soal_utuh_lulus`, `soal_dikerjakan`, `flags`, `status`.
* Flag kode (Bahasa Indonesia, tanpa singkatan misterius): `KODE_SANGAT_PENDEK`,
  `HANYA_PRINT` (ada cetak tanpa logika), `SEBAGIAN_TC_LOLOS` (sampel lolos,
  hidden gagal), `TANPA_KODE`, `KODE_GAGAL_DIAMBIL` (kegagalan fetcher + isi
  `code_errors` berisi status HTTP, BUKAN vonis ke mahasiswa).
* Verifikasi yang pernah dilakukan: jumlah best per mahasiswa = skor leaderboard
  (cth. 0+25+20+20+12 = 77); pola print-hack (`print("Bukan yang ini. SKIP!")`
  skor 13/20, `print("   x")...` skor 1/15, `print(2)` skor 12/20) tertangkap
  flag + testcase parsialnya.

## 5. Aturan kerja yang mengikat

1. **Maksimal 200 baris per file kode.** Cek dengan
   `python3 -c "print(sum(1 for _ in open('...')))"`. Jika suntingan
   melampaui, padatkan dulu (gabung baris, buang fallback mati) sebelum klaim
   selesai. Pengecualian yang diketahui saat dokumen ini ditulis:
   `popup-components.css` (216) — wajib dipecah ulang saat menyentuh CSS.
2. **Mirror Chrome -> Firefox** setiap mengubah file bersama; lalu
   `node --check` semua file JS yang diubah.
3. **Verifikasi sebelum lapor selesai**: `node --check` + uji render
   (`buildReportHtml` dengan payload sampel: JSON tertanam utuh & ter-parse,
   inline JS valid, tanpa URL eksternal).
4. Jangan menebak URL endpoint HackerRank: satu URL persis dari Network tab
   (Request URL + cuplikan respons) mengalahkan semua tebakan. Endpoint yang
   terbukti: `judge_submissions/` (list, admin), `submissions/{id}` (detail
   kode + `display_score` sebagai skor acuan + `testcase_message`).
   Respons detail kaya (`testcase_status`, `is_sample_testcase`,
   `individual_test_case_score`) tersedia untuk iterasi berikut bila diminta.
5. Throttle HackerRank nyata (429 tiap ±4 request cepat): jangan menaikkan
   paralelisme tanpa backoff; catat status ke `code_errors`, jangan diam.
6. Bahasa UI: Indonesia yang eksplisit (tanpa singkatan ambigu); status/flag
   adalah kontrak data — ganti nama hanya serentak di `audit.js`, CSV, dan
   laporan.
