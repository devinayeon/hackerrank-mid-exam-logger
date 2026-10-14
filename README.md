# HackerRank Leaderboard Scraper

Tersedia **2 versi folder extension** siap pakai:

| Folder | Browser | Manifest Version |
|---|---|---|
| [`hackerrank-leaderboard-ext-firefox`](./hackerrank-leaderboard-ext-firefox/) | **Zen Browser**, Firefox, Floorp, LibreWolf | Manifest V3 (Gecko) |
| [`hackerrank-leaderboard-ext-chrome`](./hackerrank-leaderboard-ext-chrome/) | **Chrome**, Edge, Brave, Opera | Manifest V3 (Chromium) |

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
   d:\Work\WebScrapping\hackerrank-leaderboard-ext-firefox
   ```
5. Pilih file **`manifest.json`** lalu klik **Open**.
6. **Memunculkan ikon ke Toolbar Zen:**
   * Di dalam address bar (kolom URL), klik ikon **Sliders / Settings** di ujung kanan bar.
   * Klik kanan pada **HackerRank Leaderboard Scraper** -> pilih **"Pin to Toolbar"**.

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
   d:\Work\WebScrapping\hackerrank-leaderboard-ext-chrome
   ```
6. Selesai!

---

## Cara Menggunakan

1. Buka halaman HackerRank kontes atau global, contoh:
   `https://www.hackerrank.com/contests/[nama-kontes]/leaderboard`
2. Pastikan sudah login di HackerRank.
3. Klik ikon extension di toolbar browser.
4. Atur limit peserta dan opsi "Ambil Real Name" jika diinginkan.
5. Klik **"Download Leaderboard"**.
6. File JSON bersih akan langsung terunduh ke komputer Anda.
