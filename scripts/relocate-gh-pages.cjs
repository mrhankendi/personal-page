#!/usr/bin/env node
/**
 * Relocate Next.js static export for GitHub Project Pages.
 * We have basePath '/personal-page' in HTML linking assets under /personal-page/_next/*,
 * but the default export places '_next' at root. This script nests everything (except .nojekyll)
 * inside 'personal-page/' so requests to /personal-page/... resolve correctly.
 */
const fs = require('node:fs');
const path = require('node:path');

const OUT = path.join(__dirname, '..', 'out');
const TARGET_DIR = path.join(OUT, 'personal-page');

if (!fs.existsSync(OUT)) {
  console.error('Out directory missing. Run export first.');
  process.exit(1);
}

if (fs.existsSync(TARGET_DIR)) {
  console.log('Target directory already exists, assuming relocation previously done.');
  process.exit(0);
}

fs.mkdirSync(TARGET_DIR);

// Files/directories to keep at root ('.nojekyll' only) for GitHub Pages.
const keepAtRoot = new Set(['.nojekyll']);

for (const entry of fs.readdirSync(OUT)) {
  if (keepAtRoot.has(entry)) continue;
  if (entry === 'personal-page') continue; // safety
  const from = path.join(OUT, entry);
  const to = path.join(TARGET_DIR, entry);
  fs.renameSync(from, to);
}

// Optional: create redirect index.html at root to /personal-page/
const redirectIndex = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=./personal-page/" /><title>Redirect</title></head><body>Redirecting...</body></html>`;
fs.writeFileSync(path.join(OUT, 'index.html'), redirectIndex);

console.log('Relocation complete: content moved under out/personal-page/.');
