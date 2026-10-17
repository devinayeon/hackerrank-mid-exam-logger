# HackerRank Leaderboard Scraper & Auditor

Frontend dirancang ulang dengan **Apple Design Principles** ([Apple Developer Design](https://developer.apple.com/design/)) dan **Minimalist UI** terinspirasi dari **Waymark** & **SaaSly**:
- **Clean Frosted Navigation & Inset Panels**: Tipografi SF Pro, grouped insets, toggle switches otentik iOS Cupertino.
- **Interactive Web Showcase & Studio Demo**: Live web playground (`index.html`) lengkap dengan live simulation, filter peserta, code viewer modal, dan ekspor CSV.
- **Tersedia 2 versi folder extension** siap pakai:

| Folder | Browser | Manifest Version |
|---|---|---|
| [`hackerrank-leaderboard-ext-firefox`](./hackerrank-leaderboard-ext-firefox/) | **Zen Browser**, Firefox, Floorp, LibreWolf | Manifest V3 (Gecko) |
| [`hackerrank-leaderboard-ext-chrome`](./hackerrank-leaderboard-ext-chrome/) | **Chrome**, Edge, Brave, Opera | Manifest V3 (Chromium) |

---

## Menjalankan Web Showcase (Landing Page & Studio Demo)

Untuk melihat tampilan web frontend Apple-inspired secara lokal:
```bash
python -m http.server 4321
```
Buka browser di `http://localhost:4321`.

---

## Cara Install di Zen Browser (Firefox-based)

1. Buka **Zen Browser**.
2. Di address bar, ketik:
   ```text
   about:debugging#/runtime/this-firefox
   ```
   lalu tekan **Enter**.
3. Klik tombol **"Load Temporary Add-on..."** (atau **"Muat Add-on Sementara..."**).
4. Masuk ke folder:
   ```text
   d:\Dev\Projects\hackerrank-webscrapper\hackerrank-leaderboard-ext-firefox
   ```
5. Pilih file **`manifest.json`** lalu klik **Open**.
6. **Memunculkan ikon ke Toolbar Zen:**
   * Di dalam address bar (kolom URL), klik ikon **Sliders / Settings** di ujung kanan bar.
   * Klik kanan pada **Waymark HackerRank Scraper** -> pilih **"Pin to Toolbar"**.

---

## Cara Install di Chrome / Edge / Brave

1. Buka browser Chromium pilihanmu.
2. Di address bar, ketik:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
3. Nyalakan toggle **"Developer mode"** di pojok kanan atas.
4. Klik tombol **"Load unpacked"** di pojok kiri atas.
5. Pilih folder:
   ```text
   d:\Dev\Projects\hackerrank-webscrapper\hackerrank-leaderboard-ext-chrome
   ```
6. Selesai!

---

## Cara Menggunakan

1. Buka halaman HackerRank kontes atau global, contoh:
   `https://www.hackerrank.com/contests/[nama-kontes]/leaderboard`
2. Pastikan sudah login di HackerRank.
3. Klik ikon extension di toolbar browser.
4. Pilih mode scrape:
   - **Leaderboard saja**: Download skor total & ranking cepat.
   - **Submission + audit**: Download kode per peserta, analisis testcase passed, dan penentuan kelulusan utuh (*LULUS_UTUH*).
5. Atur limit peserta dan opsi "Ambil Real Name" serta "Sertakan Source Kode".
6. Klik **"Download"**.
7. File JSON, CSV Rekapitulasi, dan Laporan Audit HTML interaktif langsung terunduh.

