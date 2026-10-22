#!/usr/bin/env node
"use strict";

// Salin hanya berkas yang boleh dipublikasikan ke dist/.
// Dipakai oleh Cloudflare Pages dan GitHub Actions; tidak ada dependency npm.

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "dist");
const files = [
  "index.html",
  "app.js",
  "styles.css",
  "_headers",
  "404.html",
  "favicon.svg"
];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const file of files) {
  const src = path.join(root, file);
  if (!fs.existsSync(src)) {
    throw new Error("Berkas wajib tidak ditemukan: " + file);
  }
  fs.copyFileSync(src, path.join(out, file));
}

// GitHub Pages: matikan proses Jekyll. Cloudflare Pages mengabaikannya.
fs.writeFileSync(path.join(out, ".nojekyll"), "");

console.log("Static site built: " + out + " (" + files.length + " berkas + .nojekyll)");
