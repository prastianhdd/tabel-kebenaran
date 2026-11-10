import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./App.css', import.meta.url), 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map(([, name, value]) => [name, value]));
function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(value => {
    const channel = parseInt(value, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
const pairs = [
  ['ink', 'surface'], ['ink', 'page'], ['muted', 'surface'], ['muted', 'page'],
  ['muted', 'surface-alt'], ['accent', 'surface'], ['accent', 'accent-soft'],
  ['on-navy', 'navy'], ['navy-muted', 'navy'], ['on-navy', 'accent'],
  ['on-navy', 'accent-hover'], ['on-navy', 'true'], ['on-navy', 'false'],
  ['false', 'danger-bg'], ['true', 'surface'],
];
for (const [foreground, background] of pairs) {
  const ratio = contrast(tokens[foreground], tokens[background]);
  assert.ok(ratio >= 4.5, `${foreground}/${background}: ${ratio.toFixed(2)}:1`);
  console.log(`${foreground}/${background}: ${ratio.toFixed(2)}:1`);
}
assert.ok(contrast('#7b8ba3', tokens.surface) >= 3, 'Batas kontrol minimal 3:1');
assert.ok(contrast('#67cfff', tokens.navy) >= 3, 'Indikator fokus pada navy minimal 3:1');
console.log('Lulus: pasangan teks utama WCAG AA 4,5:1; batas kontrol dan indikator fokus 3:1.');
