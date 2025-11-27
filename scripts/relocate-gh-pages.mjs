#!/usr/bin/env node
/**
 * Relocate Next.js static export for GitHub Project Pages.
 * Moves all exported content (except .nojekyll) under out/personal-page/ so
 * paths like /personal-page/_next/... resolve. Adds a redirect index at root.
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'out');
const TARGET_DIR = path.join(OUT, 'personal-page');

if (!fs.existsSync(OUT)) {
  console.error('Out directory missing. Run export first.');
  process.exit(1);
}

const targetExists = fs.existsSync(TARGET_DIR);
if (targetExists === false) {
  fs.mkdirSync(TARGET_DIR);
  const keepAtRoot = new Set(['.nojekyll']);
  for (const entry of fs.readdirSync(OUT)) {
    if (keepAtRoot.has(entry) || entry === 'personal-page') continue;
    const from = path.join(OUT, entry);
    const to = path.join(TARGET_DIR, entry);
    fs.renameSync(from, to);
  }
  const redirectIndex = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=./personal-page/" /><title>Redirect</title></head><body>Redirecting...</body></html>`;
  fs.writeFileSync(path.join(OUT, 'index.html'), redirectIndex);
  console.log('Relocation complete.');
} else {
  console.log('Relocation already done; skipping.');
}
