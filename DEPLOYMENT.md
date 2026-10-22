# Deployment — Cloudflare Pages + nayeonworks.tech

## Ringkasan: tidak perlu Heroku

Website ini **100% statis**: `index.html`, `app.js`, dan `styles.css`. Tidak ada
login, database, API, atau proses server. Data hasil scrape diimpor dari file
JSON ke browser dan disimpan di `localStorage`; CSV dibuat di browser.

Artinya Cloudflare Pages cukup menjadi tempat menaruh tiga file tersebut.
Heroku tidak diperlukan dan justru menambah biaya, cold start, serta permukaan
serangan (kredensial, database, patching server).

Scraping tetap dilakukan **di dalam extension** memakai sesi admin HackerRank
milik penguji. Jangan memindahkan cookie/sesi admin ke backend.

## Arsitektur deployment

```
GitHub repo
  -> Cloudflare Pages (build: node scripts/build-site.js, output: dist/)
     -> https://nayeonworks.tech
     -> _headers: CSP, X-Frame-Options, Referrer-Policy, cache
  -> GitHub Pages (fallback; workflow memakai build script yang sama)
Extension (Chrome/Firefox)
  -> download JSON + CSV
  -> penguji impor JSON ke website
  -> localStorage -> ekspor CSV
```

`scripts/build-site.js` hanya menyalin allowlist:

- `index.html`
- `app.js`
- `styles.css`
- `_headers`
- `404.html`
- `favicon.svg`
- `.nojekyll` (kosong, untuk GitHub Pages)

Folder extension, dokumen, dan test tidak ikut dipublikasikan.

## Cloudflare Pages (integrasi GitHub)

1. Buka Cloudflare Dashboard → **Workers & Pages** → **Create** →
   **Pages** → **Connect to Git**.
2. Pilih repo GitHub `devinayeon/hackerrank-mid-exam-logger`.
3. Isi build settings:
   - Framework preset: **None**
   - Build command: `node scripts/build-site.js`
   - Build output directory: `dist`
   - Root directory: `/` (kosongkan)
4. Deploy. Cloudflare akan memberi URL `https://<project>.pages.dev`.
5. Setiap push ke `main` otomatis memicu build baru.

Tidak ada environment variable atau secret yang diperlukan.

## Domain nayeonworks.tech

Cara paling sederhana dan yang direkomendasikan: pindahkan DNS domain ke
Cloudflare (gratis), lalu tambahkan domain di project Pages.

1. Cloudflare Dashboard → **Add a site** → `nayeonworks.tech` → pilih plan Free.
2. Salin dua nameserver Cloudflare ke registrar domain (tempat Anda membeli
   `nayeonworks.tech`). Tunggu propagasi.
3. Di project Pages → **Custom domains** → tambahkan:
   - `nayeonworks.tech` (apex)
   - `www.nayeonworks.tech`
4. Cloudflare membuat DNS record dan sertifikat SSL otomatis. Apex dapat
   memakai CNAME flattening, jadi tidak perlu ALIAS/ANAME.
5. Aktifkan **Always Use HTTPS**. Pilih SSL/TLS mode **Full (strict)**.
6. Buat Redirect Rule: `www.nayeonworks.tech/*` → `https://nayeonworks.tech/$1`
   dengan status 301. Cukup satu versi domain yang diindeks.

Jika DNS tetap di registrar dan tidak boleh dipindah:

- `www` bisa CNAME ke `<project>.pages.dev`.
- Apex `nayeonworks.tech` tidak bisa CNAME biasa. Gunakan fitur ALIAS/ANAME
  registrar bila ada, atau redirect apex ke `www`. Kalau registrar tidak
  mendukung keduanya, memindahkan DNS ke Cloudflare adalah jalan termudah.

## Verifikasi setelah deploy

- `https://nayeonworks.tech/` menampilkan dashboard.
- `https://nayeonworks.tech/404` menampilkan halaman 404 kustom.
- Respons header memuat `Content-Security-Policy` dan
  `X-Frame-Options: DENY` (cek di DevTools → Network → Response Headers).
- Tidak ada request ke Google Fonts atau domain lain saat halaman dibuka.
- Impor `*_submissions_audit.json` berhasil, data muncul, ekspor CSV berhasil.
- `http://` otomatis dialihkan ke `https://`.

## Development lokal

```powershell
node scripts/build-site.js
npx wrangler pages dev dist
```

Alternatif tanpa Wrangler:

```powershell
node scripts/build-site.js
python -m http.server 4321 --directory dist
```

Buka `http://localhost:4321/`. Jangan membuka `index.html` langsung dari
`file://` jika ingin menguji perilaku header/CSP yang sama dengan produksi.

## GitHub Pages (fallback)

Workflow `.github/workflows/deploy-pages.yml` tetap berjalan dan sekarang
memakai `node scripts/build-site.js` + upload `dist/`. Setelah Cloudflare Pages
stabil, GitHub Pages boleh dinonaktifkan di **Settings → Pages** tanpa
menghapus workflow (atau workflow-nya dihapus terpisah).

## Kapan backend/Heroku baru masuk akal?

| Kebutuhan | Pilihan yang tepat |
| --- | --- |
| Hanya menyajikan dashboard statis | Cloudflare Pages (sekarang) |
| Simpan rekap terpusat untuk banyak penguji | Cloudflare Pages Functions + D1/KV |
| Simpan file audit besar | Cloudflare R2 |
| Auth penguji | Cloudflare Access atau auth di Pages Functions |
| Proses long-running, container, worker non-Worker | Heroku / VPS / Cloud Run |
| Scraping otomatis tanpa browser penguji | Jangan pakai cookie admin; butuh izin/API resmi dan penanganan ToS |

Untuk alur UTS saat ini, tidak ada alasan menambah backend. Jika nanti butuh
rekap terpusat, mulai dari Cloudflare Pages Functions + D1/KV agar tetap satu
platform, bukan Heroku.

## Keamanan yang sudah diterapkan

- CSP di `_headers` (produksi) dan meta tag (lokal/GitHub Pages).
- `frame-ancestors 'none'` + `X-Frame-Options: DENY` untuk mencegah clickjacking.
- `connect-src 'none'`: halaman tidak melakukan request jaringan.
- Font sistem; tidak ada Google Fonts atau aset eksternal.
- Impor JSON dibatasi 25 MB dan divalidasi bentuknya.
- Data tidak pernah dikirim ke server; tetap di browser penguji.
