import { readdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'https://json.express';
const SKIP = new Set(['scripts', 'node_modules', '.git', 'screenshots', 'qr']);
const urls = [];

function scan(dir, depth) {
  if (depth > 3) return;
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry) || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    if (readdirSync(full).includes('index.html')) {
      const path = full.replace(/\\/g, '/');
      urls.push(BASE + '/' + path + '/');
    }
    scan(full, depth + 1);
  }
}

// Root
urls.push(BASE + '/');

// Scan subdirectories
scan('.', 0);

// Sort for consistency
urls.sort();

const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => {
  const priority = u === BASE + '/' ? '1.0' :
    u.includes('/blog/') && u !== BASE + '/blog/' ? '0.6' :
    u.includes('/about/') ? '0.5' : '0.8';
  const freq = u === BASE + '/' ? 'weekly' :
    u.includes('/blog/') ? 'monthly' : 'monthly';
  return `  <url>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

writeFileSync('sitemap.xml', xml);
console.log(`  Sitemap generated with ${urls.length} URLs`);
