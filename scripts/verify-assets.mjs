import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const folder = path.resolve(process.argv[2] || 'public/Fed3_Frame_240');
const manifest = JSON.parse(await readFile(path.join(folder, 'sequence.json'), 'utf8'));
const files = (await readdir(folder)).filter(f => /^frame_\d{5}\.png$/.test(f));
const issues = [];
let actualBytes = 0;
for (const frame of manifest.frames) {
  try {
    const data = await readFile(path.join(folder, frame.file)); actualBytes += data.length;
    const hash = createHash('sha256').update(data).digest('hex');
    const complete = data.length >= 33 && data.subarray(1, 4).toString() === 'PNG' && data.subarray(-8, -4).toString() === 'IEND';
    const dimensions = complete && data.readUInt32BE(16) === 1600 && data.readUInt32BE(20) === 900;
    if (hash !== frame.sha256 || data.length !== frame.bytes || !dimensions) issues.push({ file: frame.file, expectedBytes: frame.bytes, actualBytes: data.length, valid: false });
  } catch (error) { issues.push({ file: frame.file, error: error.message }); }
}
console.log(JSON.stringify({ frames: files.length, expectedFrames: 240, expectedBytes: manifest.total_png_bytes, actualBytes, issues }, null, 2));
if (files.length !== 240 || issues.length) process.exitCode = 1;
