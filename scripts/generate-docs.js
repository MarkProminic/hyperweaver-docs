#!/usr/bin/env node

/**
 * @fileoverview Fetch the component changelogs for the docs build.
 * @description The API reference is no longer embedded in the docs site. It is served
 * live by each backend at /api-docs (a dark-themed Swagger UI), and the Hyperweaver
 * Server additionally relays a selected agent's spec at /agent/api-docs; the app's
 * sidebar links to both. So this script's only job is to pull each component's
 * CHANGELOG.md at build time for the changelog pages (Jekyll renders them via
 * {% include %}). A fetch failure writes a placeholder so the build never breaks.
 */

import fs from 'fs';
import path from 'path';

const CHANGELOGS = [
  {
    url: 'https://raw.githubusercontent.com/Makr91/hyperweaver-server/refs/heads/main/CHANGELOG.md',
    out: 'changelogs/hyperweaver-server.md',
  },
  {
    url: 'https://raw.githubusercontent.com/Makr91/zoneweaver-agent/refs/heads/main/CHANGELOG.md',
    out: 'changelogs/zoneweaver-agent.md',
  },
];

const fetchChangelog = async ({ url, out }) => {
  const outPath = path.join(process.cwd(), out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  let body;
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    body = await resp.text();
    console.log(`✅ ${out} (fetched)`);
  } catch (err) {
    body = `> Changelog is currently unavailable (${err.message}). See the project's GitHub releases.\n`;
    console.warn(`⚠️  ${out}: ${err.message} — wrote placeholder`);
  }
  // raw guard: the changelog is external markdown (arbitrary commit-message text);
  // stop Liquid (strict mode) from trying to interpret any {{ }} / {% %} inside it.
  fs.writeFileSync(outPath, `{% raw %}\n${body}\n{% endraw %}\n`);
};

const generateDocs = async () => {
  console.log('🔧 Generating docs assets...');
  await Promise.all(CHANGELOGS.map(c => fetchChangelog(c)));
  console.log('🎉 Docs assets generated.');
};

generateDocs().catch(error => {
  console.error('❌ Error generating documentation:', error.message);
  process.exit(1);
});
