/**
 * Regenerates the PWA / home screen icons in src/assets/icons from the two SVG
 * sources next to them. Rendered with headless Chromium so the gradients and
 * the antialiasing match what a browser would draw.
 *
 * One-off tool, deliberately not a dependency of the app:
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node tools/generate-icons.mjs
 *
 * Also writes favicon.ico (a PNG-in-ICO container with 16/32/48 px entries),
 * which every browser released this decade understands.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'src', 'assets', 'icons');

// [source svg, output file, size]
const targets = [
  ['icon.svg', join(iconsDir, 'icon-192.png'), 192],
  ['icon.svg', join(iconsDir, 'icon-512.png'), 512],
  ['icon-square.svg', join(iconsDir, 'icon-maskable-192.png'), 192],
  ['icon-square.svg', join(iconsDir, 'icon-maskable-512.png'), 512],
  // iOS ignores the web app manifest and only ever reads this one.
  ['icon-square.svg', join(iconsDir, 'apple-touch-icon.png'), 180],
];

const faviconSizes = [16, 32, 48];

const browser = await chromium.launch();

async function render(svgFile, size) {
  const svg = readFileSync(join(iconsDir, svgFile), 'utf8');
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:transparent}` +
      `svg{display:block;width:${size}px;height:${size}px}</style>${svg}`
  );
  const png = await page.screenshot({ omitBackground: true });
  await page.close();
  return png;
}

for (const [svgFile, out, size] of targets) {
  writeFileSync(out, await render(svgFile, size));
  console.log(`${out}  ${size}x${size}`);
}

// ICO: 6 byte header, then one 16 byte directory entry per image, then the
// PNG payloads. Width/height of 0 in an entry means 256.
const images = [];
for (const size of faviconSizes) {
  images.push({ size, png: await render('icon.svg', size) });
}
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4);

let offset = 6 + 16 * images.length;
const entries = images.map(({ size, png }) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size % 256, 0);
  entry.writeUInt8(size % 256, 1);
  entry.writeUInt8(0, 2); // palette colours
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});

const favicon = join(root, 'src', 'favicon.ico');
writeFileSync(favicon, Buffer.concat([header, ...entries, ...images.map((i) => i.png)]));
console.log(`${favicon}  ${faviconSizes.join('/')}`);

await browser.close();
