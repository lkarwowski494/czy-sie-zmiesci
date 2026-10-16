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

console.log('Generating official Apps4Craft Studio production assets for FitCheck...');

// 1. Icon (1024x1024)
// Standard Apps4Craft: Deep Ceramic Basalt #121214 with luxury embossed metallic titanium sky #38BDF8 emblem.
const iconBuffer = createPng(1024, 1024, (x, y, w, h) => {
  const nx = (x - w / 2) / (w / 2);
  const ny = (y - h / 2) / (h / 2);
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Deep basalt background #121214 with subtle radial warmth
  const rBg = 18;
  const gBg = 18;
  const bBg = 20;

  // Outer Craft Emblem Shield / Ring
  // Radius: 0.72 outer, 0.64 inner
  const inOuterRing = dist < 0.74 && dist > 0.66;
  const inInnerRing = dist < 0.65 && dist > 0.63;

  // Center Isometric Cube & Precision Aperture Calipers
  // Isometric coordinates:
  // Top face: -0.32 < x < 0.32, y < 0, diamond
  const dX = Math.abs(nx);
  const isTopFace = ny < 0.02 && ny > -0.38 && (dX * 1.5 + Math.abs(ny + 0.18) * 1.5 < 0.48);
  const isLeftFace = nx < 0.00 && nx > -0.32 && ny >= 0.00 && ny < 0.38 && (dX * 1.2 + (ny - 0.19) * 0.8 < 0.42);
  const isRightFace = nx >= 0.00 && nx < 0.32 && ny >= 0.00 && ny < 0.38 && (dX * 1.2 + (ny - 0.19) * 0.8 < 0.42);

  // Precision Dimension Axis / Caliper ticks
  const isHorizAxis = Math.abs(ny - 0.44) < 0.015 && Math.abs(nx) < 0.45;
  const isTickLeft = Math.abs(nx + 0.45) < 0.018 && Math.abs(ny - 0.44) < 0.05;
  const isTickRight = Math.abs(nx - 0.45) < 0.018 && Math.abs(ny - 0.44) < 0.05;
  const isCaliper = isHorizAxis || isTickLeft || isTickRight;

  // Corner craft studs (4 points of the compass: 12, 3, 6, 9 o'clock)
  const isStudTop = Math.abs(nx) < 0.03 && Math.abs(ny + 0.70) < 0.03;
  const isStudBottom = Math.abs(nx) < 0.03 && Math.abs(ny - 0.70) < 0.03;
  const isStudLeft = Math.abs(nx + 0.70) < 0.03 && Math.abs(ny) < 0.03;
  const isStudRight = Math.abs(nx - 0.70) < 0.03 && Math.abs(ny) < 0.03;
  const isStud = isStudTop || isStudBottom || isStudLeft || isStudRight;

  if (isStud) {
    return [244, 239, 234, 255]; // Pure ceramic white stud #F4EFEA
  }

  if (inOuterRing) {
    // Metallic Titanium border #38BDF8 with top specular highlight #BAE6FD
    if (ny < -0.3) return [186, 230, 253, 255]; // #BAE6FD Light titanium
    return [56, 189, 248, 255]; // #38BDF8 Titanium Sky
  }

  if (inInnerRing) {
    return [2, 132, 199, 255]; // #0284C7 Deep Cobalt shadow
  }

  if (isTopFace) {
    // Top face receives direct specular light (Bright titanium #E0F2FE)
    return [224, 242, 254, 255];
  }

  if (isLeftFace) {
    // Left face: Anodized Sky #38BDF8
    return [56, 189, 248, 255];
  }

  if (isRightFace) {
    // Right face: Shadowed cobalt titanium #0369A1
    return [3, 105, 161, 255];
  }

  if (isCaliper) {
    return [251, 191, 36, 255]; // Warm Gold measurement caliper mark #FBBF24
  }

  // Deep basalt ceramic background #121214
  return [rBg, gBg, bBg, 255];
});

fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconBuffer);
console.log('  -> assets/icon.png created (1024x1024 Apps4Craft Basalt & Titanium)');

// 2. Adaptive Icon (Android)
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), iconBuffer);
console.log('  -> assets/adaptive-icon.png created (1024x1024)');

// 3. Splash Screen (1284x2778) - Deep Basalt #121214 with central emblem
const splashBuffer = createPng(1284, 2778, (x, y, w, h) => {
  const nx = (x - w / 2) / (w / 2);
  const ny = (y - h / 2) / (h / 2);

  // Scaled emblem in center
  const scale = 2.8;
  const ex = nx * scale;
  const ey = ny * scale * (2778 / 1284);
  const edist = Math.sqrt(ex * ex + ey * ey);

  if (edist < 0.55 && edist > 0.48) {
    return [56, 189, 248, 255]; // Titanium ring
  }

  const dX = Math.abs(ex);
  const isTopFace = ey < 0.02 && ey > -0.28 && (dX * 1.5 + Math.abs(ey + 0.14) * 1.5 < 0.36);
  const isLeftFace = ex < 0.00 && ex > -0.24 && ey >= 0.00 && ey < 0.28 && (dX * 1.2 + (ey - 0.14) * 0.8 < 0.32);
  const isRightFace = ex >= 0.00 && ex < 0.24 && ey >= 0.00 && ey < 0.28 && (dX * 1.2 + (ey - 0.14) * 0.8 < 0.32);

  if (isTopFace) return [224, 242, 254, 255];
  if (isLeftFace) return [56, 189, 248, 255];
  if (isRightFace) return [3, 105, 161, 255];

  // Deep Basalt #121214
  return [18, 18, 20, 255];
});

fs.writeFileSync(path.join(assetsDir, 'splash.png'), splashBuffer);
console.log('  -> assets/splash.png created (1284x2778)');

// 4. Favicon (48x48)
const faviconBuffer = createPng(48, 48, (x, y, w, h) => {
  const nx = (x - w / 2) / (w / 2);
  const ny = (y - h / 2) / (h / 2);
  const dist = Math.sqrt(nx * nx + ny * ny);
  if (dist < 0.7) {
    return [56, 189, 248, 255];
  }
  return [18, 18, 20, 255];
});

fs.writeFileSync(path.join(assetsDir, 'favicon.png'), faviconBuffer);
console.log('  -> assets/favicon.png created (48x48)');

console.log('All Apps4Craft production assets generated successfully.');
