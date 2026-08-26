import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Premium Vector SVG Logo: "H" + "₹" (Rupee) + Google 4-Color Fintech Ribbon
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E1524" />
      <stop offset="50%" stop-color="#141E32" />
      <stop offset="100%" stop-color="#090D16" />
    </linearGradient>

    <!-- Border Glow Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4285F4" stop-opacity="0.8" />
      <stop offset="33%" stop-color="#34A853" stop-opacity="0.6" />
      <stop offset="66%" stop-color="#FBBC04" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#EA4335" stop-opacity="0.8" />
    </linearGradient>

    <!-- Blue Pillar Gradient -->
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>

    <!-- Green Pillar Gradient -->
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4ADE80" />
      <stop offset="100%" stop-color="#16A34A" />
    </linearGradient>

    <!-- Rupee Loop Gradient -->
    <linearGradient id="rupeeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="35%" stop-color="#38BDF8" />
      <stop offset="70%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#F87171" />
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="glowShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#4285F4" flood-opacity="0.35" />
    </filter>
    
    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Squircle Base Canvas -->
  <rect x="16" y="16" width="480" height="480" rx="120" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="6" />

  <!-- Inner Subtle Grid Ring -->
  <circle cx="256" cy="256" r="190" fill="none" stroke="#1E2B42" stroke-width="2" stroke-dasharray="8 8" opacity="0.6" />

  <!-- Glow Backdrop -->
  <circle cx="256" cy="256" r="120" fill="#4285F4" opacity="0.08" filter="blur(30px)" />

  <!-- MONOGRAM "H" + "₹" EMBLEM -->
  <g filter="url(#glowShadow)">
    <!-- Left Pillar of 'H' (Blue) -->
    <rect x="120" y="125" width="48" height="262" rx="24" fill="url(#blueGrad)" />

    <!-- Right Pillar of 'H' (Green) -->
    <rect x="344" y="125" width="48" height="262" rx="24" fill="url(#greenGrad)" />

    <!-- Upper Rupee Strike Bar (connecting H with Rupee) -->
    <rect x="120" y="195" width="272" height="32" rx="16" fill="url(#rupeeGrad)" />

    <!-- Lower Rupee Strike Bar -->
    <rect x="120" y="255" width="220" height="32" rx="16" fill="url(#rupeeGrad)" />

    <!-- Dynamic Curved Sweep connecting the bars into ₹ + H structure -->
    <path d="M 230 195 C 340 195, 340 285, 230 285 C 290 285, 320 330, 360 387" 
          fill="none" 
          stroke="url(#rupeeGrad)" 
          stroke-width="32" 
          stroke-linecap="round" 
          stroke-linejoin="round" />
  </g>

  <!-- Google 4-Color Accent Orbs -->
  <circle cx="144" cy="95" r="12" fill="#4285F4" />
  <circle cx="368" cy="95" r="12" fill="#34A853" />
  <circle cx="395" cy="415" r="10" fill="#FBBC04" />
  <circle cx="115" cy="415" r="10" fill="#EA4335" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), logoSvg);
fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSvg);

// Helper function to create valid crisp RGBA PNGs
function createPng(width, height, drawFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdr);
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcData = chunk.subarray(4, 8 + len);
  const crc = crc32(crcData);
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) | 0;
}

const table = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[n] = c;
}

// Procedural rendering for PNG icon (Squircle + Himesh "H" & "₹" Monogram in Google Colors)
function renderHimeshLogoPixel(x, y, w, h) {
  const nx = (x / w) * 512;
  const ny = (y / h) * 512;

  // Squircle distance
  const cx = 256, cy = 256;
  const dx = Math.abs(nx - cx) / 225;
  const dy = Math.abs(ny - cy) / 225;
  const r = Math.pow(Math.pow(dx, 4) + Math.pow(dy, 4), 0.25);

  if (r > 1.05) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Border gradient
  if (r >= 0.96) {
    if (nx < 256 && ny < 256) return [66, 133, 244, 255]; // Blue
    if (nx >= 256 && ny < 256) return [52, 168, 83, 255]; // Green
    if (nx >= 256 && ny >= 256) return [251, 188, 4, 255]; // Yellow
    return [234, 67, 53, 255]; // Red
  }

  // Background gradient: #0E1524 to #141E32
  const bgR = Math.round(14 + (ny / 512) * 10);
  const bgG = Math.round(21 + (ny / 512) * 12);
  const bgB = Math.round(36 + (ny / 512) * 16);

  // Left Pillar of H (nx: 120-168, ny: 125-387)
  if (nx >= 120 && nx <= 168 && ny >= 125 && ny <= 387) {
    return [66, 133, 244, 255]; // Google Blue
  }

  // Right Pillar of H (nx: 344-392, ny: 125-387)
  if (nx >= 344 && nx <= 392 && ny >= 125 && ny <= 387) {
    return [52, 168, 83, 255]; // Google Green
  }

  // Upper Strike Bar of Rupee/H (nx: 120-392, ny: 195-227)
  if (nx >= 120 && nx <= 392 && ny >= 195 && ny <= 227) {
    const t = (nx - 120) / (392 - 120);
    const cr = Math.round(66 + t * (251 - 66));
    const cg = Math.round(133 + t * (188 - 133));
    const cb = Math.round(244 - t * 200);
    return [cr, cg, cb, 255];
  }

  // Lower Strike Bar of Rupee/H (nx: 120-340, ny: 255-287)
  if (nx >= 120 && nx <= 340 && ny >= 255 && ny <= 287) {
    const t = (nx - 120) / 220;
    const cr = Math.round(96 + t * (234 - 96));
    const cg = Math.round(165 + t * (67 - 165));
    const cb = Math.round(250 - t * 190);
    return [cr, cg, cb, 255];
  }

  // Rupee curve loop (center-right section)
  const arcDx = nx - 230;
  const arcDy = ny - 240;
  const arcDist = Math.sqrt(arcDx * arcDx + arcDy * arcDy);
  if (arcDist >= 40 && arcDist <= 72 && nx >= 230 && ny >= 195 && ny <= 285) {
    return [251, 188, 4, 255]; // Yellow
  }

  // Rupee diagonal downward leg
  if (nx >= 230 && nx <= 360 && ny >= 285 && ny <= 387) {
    const expectedX = 230 + ((ny - 285) / (387 - 285)) * (360 - 230);
    if (Math.abs(nx - expectedX) <= 16) {
      return [234, 67, 53, 255]; // Red
    }
  }

  return [bgR, bgG, bgB, 255];
}

// Generate 192x192, 512x512, and 64x64 favicon
const icon192 = createPng(192, 192, renderHimeshLogoPixel);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);

const icon512 = createPng(512, 512, renderHimeshLogoPixel);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);

const favicon = createPng(64, 64, renderHimeshLogoPixel);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);

console.log('Successfully generated new "H" + "₹" Himesh Pay logo (SVG, 192px, 512px, favicon.ico)!');
