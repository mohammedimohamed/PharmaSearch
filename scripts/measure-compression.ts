import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

export interface CompressionMetrics {
  uncompressedBytes: number;
  uncompressedMb: number;
  gzipDefaultBytes: number;
  gzipDefaultMb: number;
  gzipDefaultRatio: number;
  gzipMaxBytes: number;
  gzipMaxMb: number;
  gzipMaxRatio: number;
  brotliDefaultBytes: number;
  brotliDefaultMb: number;
  brotliDefaultRatio: number;
  brotliMaxBytes: number;
  brotliMaxMb: number;
  brotliMaxRatio: number;
}

export function measureCompression(filePath: string): CompressionMetrics {
  const buffer = fs.readFileSync(filePath);
  const rawSize = buffer.length;

  const gzipDefault = zlib.gzipSync(buffer, { level: 6 });
  const gzipMax = zlib.gzipSync(buffer, { level: 9 });

  const brotliDefault = zlib.brotliCompressSync(buffer);
  const brotliMax = zlib.brotliCompressSync(buffer, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    },
  });

  return {
    uncompressedBytes: rawSize,
    uncompressedMb: Number((rawSize / 1024 / 1024).toFixed(3)),
    gzipDefaultBytes: gzipDefault.length,
    gzipDefaultMb: Number((gzipDefault.length / 1024 / 1024).toFixed(3)),
    gzipDefaultRatio: Number(((gzipDefault.length / rawSize) * 100).toFixed(1)),
    gzipMaxBytes: gzipMax.length,
    gzipMaxMb: Number((gzipMax.length / 1024 / 1024).toFixed(3)),
    gzipMaxRatio: Number(((gzipMax.length / rawSize) * 100).toFixed(1)),
    brotliDefaultBytes: brotliDefault.length,
    brotliDefaultMb: Number((brotliDefault.length / 1024 / 1024).toFixed(3)),
    brotliDefaultRatio: Number(((brotliDefault.length / rawSize) * 100).toFixed(1)),
    brotliMaxBytes: brotliMax.length,
    brotliMaxMb: Number((brotliMax.length / 1024 / 1024).toFixed(3)),
    brotliMaxRatio: Number(((brotliMax.length / rawSize) * 100).toFixed(1)),
  };
}

const targetFile = path.resolve(process.cwd(), 'public/data/nomenclature.json');
if (fs.existsSync(targetFile)) {
  const m = measureCompression(targetFile);
  console.log('=== EXACT MEASURED COMPRESSION METRICS ===');
  console.log(`Target: ${targetFile}`);
  console.log(`Uncompressed:        ${m.uncompressedBytes.toLocaleString()} bytes (${m.uncompressedMb} MB)`);
  console.log(`Gzip (Level 6):      ${m.gzipDefaultBytes.toLocaleString()} bytes (${m.gzipDefaultMb} MB) [${m.gzipDefaultRatio}% of raw]`);
  console.log(`Gzip (Level 9 Max):  ${m.gzipMaxBytes.toLocaleString()} bytes (${m.gzipMaxMb} MB) [${m.gzipMaxRatio}% of raw]`);
  console.log(`Brotli (Default):    ${m.brotliDefaultBytes.toLocaleString()} bytes (${m.brotliDefaultMb} MB) [${m.brotliDefaultRatio}% of raw]`);
  console.log(`Brotli (Quality 11): ${m.brotliMaxBytes.toLocaleString()} bytes (${m.brotliMaxMb} MB) [${m.brotliMaxRatio}% of raw]`);
}
