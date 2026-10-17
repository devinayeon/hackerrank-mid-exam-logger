# HackerRank Leaderboard Scraper & UTS Auditor 🎓

Penguji otomatis kelulusan ujian coding (**UTS / UAS Algoritma dan Pemrograman**) di HackerRank dengan deteksi kepatuhan testcase utuh dan anti-print hack.

Dirancang dengan antarmuka elegan mengikuti **Apple Human Interface Guidelines (HIG)** dan prinsip **Minimalist UI** (SF Pro typography, frosted glass blur, iOS Cupertino toggle, Apple pop-up buttons, dan responsive table pagination).

---

## 🚀 Alur Cepat (3 Langkah untuk Rekan / Teman Penguji)

Teman atau rekan asisten dapat langsung memeriksa nilai ujian tanpa perlu menulis kode atau menjalankan server lokal:

### 1. Pasang Ekstensi di Browser
Pilih varian ekstensi sesuai browser yang digunakan:

* **Chrome / Edge / Brave / Opera** (`hackerrank-leaderboard-ext-chrome`):
  1. Buka `chrome://extensions` di browser.
  2. Aktifkan toggle **Developer mode** di pojok kanan atas.
  3. Klik tombol **Load unpacked** lalu pilih folder `hackerrank-leaderboard-ext-chrome`.
* **Zen Browser / Firefox / Floorp** (`hackerrank-leaderboard-ext-firefox`):
  1. Buka `about:debugging#/runtime/this-firefox`.
  2. Klik **Load Temporary Add-on...** lalu pilih file `manifest.json` di dalam folder `hackerrank-leaderboard-ext-firefox`.
  3. Sematkan (*Pin*) ekstensi ke toolbar browser agar mudah diakses.

---

### 2. Jalankan Scraping di HackerRank
1. Login ke akun HackerRank yang memiliki hak akses admin / penguji kontes.
2. Buka tab kontes yang ingin diperiksa (misalnya halaman `/judge/submissions` atau `/leaderboard`).
3. Klik ikon ekstensi di toolbar:
   * Pilih mode **"Submission + audit per peserta"** untuk memeriksa baris kode dan testcase.
   * Atur limit peserta atau biarkan default untuk mengaudit seluruh peserta.
4. Klik tombol **"Download"**.
5. Ekstensi akan otomatis mengunduh 2 berkas:
   * `[nama-kontes]_submissions_audit.json` (berisi detail seluruh kode, testcase, skor, dan audit status).
   * `[nama-kontes]_rekap_audit.csv` (rekap nilai resmi format Excel/Spreadsheet).

---

### 3. Buka Dashboard & Impor Data
Buka **Dashboard Studio UTS**:
* **Versi Online (GitHub Pages)**: Buka tautan GitHub Pages Anda (misal: `https://<username>.github.io/hackerrank-webscrapper/`).
* **Versi Offline / Lokal**:
  ```bash
  python -m http.server 4321
  ```
  lalu buka `http://localhost:4321`.

Di dalam dashboard:
1. Klik tombol **"Impor Scraped JSON"** (atau drag-and-drop file `*_submissions_audit.json` ke area dashboard).
2. Seluruh metrik kelulusan, tabel ranking berpaginasi (10 item/halaman), inspeksi kode sumber, dan indikasi kecurangan langsung ditampilkan seketika!

---

## 🌟 Fitur Utama Dashboard Studio UTS

| Fitur | Deskripsi |
|---|---|
| **Ringkasan Nilai** | Metrik total peserta terindeks, persentase `LULUS_UTUH`, filter status instan (`Semua`, `LULUS UTUH`, `PERLU REVIEW`, `BELUM LULUS`), pencarian nama/username, dan ekspor CSV rekapitulasi. |
| **Table Pagination** | Paginasi tabel 10 baris per halaman bergaya Apple HIG dengan navigasi halaman responsif. |
| **Pemeriksaan Kode** | Peninjau kode interaktif dengan pemilih soal (*chips*), penghitung baris kode, Apple HIG Pop-up Button menu dengan pencarian cepat nama mahasiswa, serta scroller horizontal dan vertikal. |
| **Audit Forensik Ujian** | Verifikasi otomatis aturan kelulusan: minimal 1 soal *Accepted* (seluruh testcase termasuk hidden cases lolos). Kode yang hanya menggunakan `print(...)` tanpa logika algoritma otomatis ditandai `HANYA_PRINT` / `SEBAGIAN_TC_LOLOS`. |
| **Log Anti-Throttle** | Panel telemetri *rate-limit compliance* (pacing 1.2 detik antar-request single-worker, status HTTP 200, dan adaptive backoff HTTP 429). |

---

## 📁 Struktur Berkas

```text
├── .github/workflows/
│   └── deploy-pages.yml                  # Otomasi deploy GitHub Pages & ZIP ekstensi
├── hackerrank-leaderboard-ext-chrome/    # Ekstensi Chromium (Manifest V3)
├── hackerrank-leaderboard-ext-firefox/   # Ekstensi Firefox & Zen Browser (Gecko)
├── index.html                            # Frontend Dashboard Studio UTS
├── styles.css                            # Desain Apple HIG & Minimalist UI
├── app.js                                # Logika interaktif dashboard & parsing data
├── AGENTS.md                             # Aturan arsitektur & konteks sistem
└── README.md                             # Panduan penggunaan
```

---

## 🛠️ Deploy Proyek ke GitHub

Untuk membagikan proyek ini ke GitHub agar teman dapat menggunakannya:

1. **Buat repositori baru di GitHub** (misalnya `hackerrank-webscrapper`).
2. **Hubungkan & Push ke GitHub**:
   ```bash
   git remote add github https://github.com/<USERNAME-ANDA>/hackerrank-webscrapper.git
   git branch -M main
   git push -u github main
   ```
3. **Aktifkan GitHub Pages**:
   * Buka repositori di GitHub &rarr; klik tab **Settings**.
   * Di menu kiri, pilih **Pages**.
   * Pada bagian **Build and deployment** &rarr; **Source**, pilih **GitHub Actions**.
   * Workflow akan otomatis mendeploy web dashboard Anda ke `https://<USERNAME-ANDA>.github.io/hackerrank-webscrapper/`.
4. Berikan tautan GitHub Pages dan link repositori tersebut ke teman Anda!
