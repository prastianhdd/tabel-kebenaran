import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const html = read('../index.html');
const url = 'https://tabellogika.vercel.app/';
const author = 'Prastian Hidayat';
assert.match(html, /<html lang="id">/);
assert.match(html, /<title>Kalkulator Tabel Kebenaran Online \| Prastian Hidayat<\/title>/);
assert.ok(html.includes(`<link rel="canonical" href="${url}" />`));
assert.ok(html.includes(`<meta name="author" content="${author}" />`));
assert.ok(html.includes(`<meta property="og:url" content="${url}" />`));
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema['@context'], 'https://schema.org');
const graph = schema['@graph'];
const ids = new Set(graph.map(node => node['@id']));
assert.equal(graph.find(node => node['@type'] === 'Person').name, author);
assert.equal(graph.find(node => node['@type'] === 'WebApplication').url, url);
for (const node of graph) {
  for (const value of Object.values(node)) {
    if (value?.['@id']) assert.ok(ids.has(value['@id']), `Referensi tidak ditemukan: ${value['@id']}`);
  }
}
assert.match(html, /<div id="root">\s*<main>/);
assert.ok(read('./App.jsx').includes(`Dibuat oleh ${author}`));
assert.ok(read('../public/robots.txt').includes(`Sitemap: ${url}sitemap.xml`));
assert.ok(read('../public/sitemap.xml').includes(`<loc>${url}</loc>`));
console.log('Lulus: author, metadata, canonical, structured data, konten HTML awal, robots.txt, dan sitemap.');
