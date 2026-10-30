// Renders the tin logo to the PNG icons the PWA and iOS Home Screen need.
// Run: node scripts/make-icons.mjs
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const tin = (scale) => `
  <g transform="translate(256 256) scale(${scale}) translate(-32 -32)">
    <rect x="4" y="12" width="56" height="40" rx="14" fill="#1c6e72"/>
    <rect x="9" y="17" width="46" height="30" rx="10" fill="#e3a52a"/>
    <path d="M17 32c6-7 17-8 25-3l6-4v14l-6-4c-8 5-19 4-25-3z" fill="#13263a"/>
    <circle cx="22.5" cy="31" r="1.6" fill="#e3a52a"/>
    <circle cx="49" cy="22" r="3" fill="none" stroke="#13263a" stroke-width="2"/>
  </g>`;

// iOS draws its own rounded corners, so icons are full-bleed squares.
const svg = (scale) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <rect width="512" height="512" fill="#f6f1e7"/>${tin(scale)}</svg>`);

await mkdir("public/icons", { recursive: true });
const outputs = [
  ["icon-192.png", 192, 6.4],
  ["icon-512.png", 512, 6.4],
  ["apple-touch-icon.png", 180, 6.4],
  ["icon-maskable-512.png", 512, 4.8], // extra padding for the maskable safe zone
];
for (const [name, size, scale] of outputs) {
  await sharp(svg(scale)).resize(size, size).png().toFile(`public/icons/${name}`);
  console.log("wrote", name);
}

// Browser-tab favicon: the tin alone on a transparent background, as a
// multi-size .ico (each size stored as an embedded PNG).
const tinOnly = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512">
  ${tin(1).replace(/<g [^>]*>/, "<g>")}</svg>`);
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => sharp(tinOnly).resize(s, s).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(s, entry);
  header.writeUInt8(s, entry + 1);
  header.writeUInt16LE(1, entry + 4); // color planes
  header.writeUInt16LE(32, entry + 6); // bits per pixel
  header.writeUInt32LE(pngs[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += pngs[i].length;
});
await writeFile("src/app/favicon.ico", Buffer.concat([header, ...pngs]));
console.log("wrote favicon.ico");
