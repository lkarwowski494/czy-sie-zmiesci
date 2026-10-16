import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal, zero-dependency pure Node.js PNG encoder
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function createPng(width, height, getPixel) {
  // Format: RGBA
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a !== undefined ? a : 255;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const len = data ? data.length : 0;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    typeBuf.copy(chunk, 4);
    if (data) data.copy(chunk, 8);
    const crc = crc32(Buffer.concat([typeBuf, data || Buffer.alloc(0)]));
    chunk.writeUInt32BE(crc, 8 + len);
    return chunk;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', null);

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Ensure assets directory exists
const assetsDir = path.resolve('assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

console.log('Generating production assets for Czy się zmieści? (FitCheck)...');

// 1. Icon (1024x1024)
// Design: Sleek dark navy #0F172A background, glowing blue/cyan trunk contour, 3D box, and green checkmark.
const iconBuffer = createPng(1024, 1024, (x, y, w, h) => {
  const nx = (x - w / 2) / (w / 2);
  const ny = (y - h / 2) / (h / 2);
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Radial subtle gradient from #1E293B in center to #0F172A on edges
  const rBg = Math.round(30 - dist * 15);
  const gBg = Math.round(41 - dist * 18);
  const bBg = Math.round(59 - dist * 17);

  // Outer Trunk Frame / Hatch border (rounded rectangle contour)
  // Box bounds: [-0.6, 0.6] horizontally, [-0.4, 0.5] vertically
  const inFrameOuter = Math.abs(nx) < 0.68 && ny > -0.55 && ny < 0.62;
  const inFrameInner = Math.abs(nx) < 0.58 && ny > -0.45 && ny < 0.52;
  const isTrunkBorder = inFrameOuter && !inFrameInner;

  // Isometric Cargo Box inside the trunk
  // Isometric projection coordinates
  const isoX = (nx * 0.7 - ny * 0.4);
  const isoY = (nx * 0.4 + ny * 0.7);

  const inBoxTop = Math.abs(nx) < 0.35 && ny > -0.22 && ny < 0.05 && (Math.abs(nx * 1.5 + ny * 2) < 0.5);
  const inBoxFront = Math.abs(nx) < 0.32 && ny >= 0.05 && ny < 0.38;

  // Checkmark circle at top right: center at nx = 0.48, ny = -0.45, radius 0.22
  const cdx = nx - 0.48;
  const cdy = ny - (-0.45);
  const inCheckCircle = (cdx * cdx + cdy * cdy) < (0.20 * 0.20);
  const inCheckBorder = (cdx * cdx + cdy * cdy) < (0.23 * 0.23);

  // Checkmark tick shape inside the circle
  // Normalized within check circle:
  const tX = (cdx) / 0.20;
  const tY = (cdy) / 0.20;
  const onTickArm1 = tX >= -0.5 && tX <= -0.1 && Math.abs(tY - (tX + 0.1)) < 0.12;
  const onTickArm2 = tX >= -0.1 && tX <= 0.5 && Math.abs(tY - (-1.2 * tX - 0.05)) < 0.12;
  const isTick = onTickArm1 || onTickArm2;

  if (inCheckCircle) {
    if (isTick) {
      return [255, 255, 255, 255]; // Pure white tick
    }
    return [16, 185, 129, 255]; // Emerald Green #10B981
  }
  if (inCheckBorder) {
    return [15, 23, 42, 255]; // Dark outline separator
  }

  if (inBoxTop) {
    return [251, 191, 36, 255]; // Warm Gold Top #FBBF24
  }
  if (inBoxFront) {
    const isTape = Math.abs(nx) < 0.05;
    if (isTape) return [217, 119, 6, 255]; // Darker amber tape #D97706
    return [245, 158, 11, 255]; // Amber Box Front #F59E0B
  }

  if (isTrunkBorder) {
    return [59, 130, 246, 255]; // Royal Blue Hatch Outline #3B82F6
  }

  return [Math.max(15, rBg), Math.max(23, gBg), Math.max(42, bBg), 255];
});

fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconBuffer);
console.log('  -> assets/icon.png created (1024x1024)');

// 2. Adaptive Icon (Android)
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), iconBuffer);
console.log('  -> assets/adaptive-icon.png created (1024x1024)');

// 3. Splash Screen (1284x2778)
const splashBuffer = createPng(1284, 2778, (x, y, w, h) => {
  const nx = (x - w / 2) / (w / 2);
  const ny = (y - h / 2) / (h / 2);

  // Background gradient
  const rBg = 15;
  const gBg = 23;
  const bBg = 42;

  // Center emblem scaled
  const emblemX = nx * 2.2;
  const emblemY = ny * 3.5;
  const inEmblem = (emblemX * emblemX + emblemY * emblemY) < 0.25;

  if (inEmblem) {
    return [59, 130, 246, 255];
  }

  return [rBg, gBg, bBg, 255];
});

fs.writeFileSync(path.join(assetsDir, 'splash.png'), splashBuffer);
console.log('  -> assets/splash.png created (1284x2778)');

// 4. Favicon (48x48)
const faviconBuffer = createPng(48, 48, (x, y, w, h) => {
  const nx = (x - w / 2) / (w / 2);
  const ny = (y - h / 2) / (h / 2);
  const dist = Math.sqrt(nx * nx + ny * ny);
  if (dist < 0.7) {
    return [16, 185, 129, 255];
  }
  return [15, 23, 42, 255];
});

fs.writeFileSync(path.join(assetsDir, 'favicon.png'), faviconBuffer);
console.log('  -> assets/favicon.png created (48x48)');

console.log('All production assets generated successfully.');
