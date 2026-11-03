import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import path from 'node:path';

// Audit the supplied, already repaired sequence before updating its stale index.
const folder = path.resolve('public/Fed3_Frame_240');
const manifest = JSON.parse(await readFile(path.join(folder, 'sequence.json'), 'utf8'));
const original = new Map(manifest.frames.map(frame => [frame.sha256, frame.index]));
const substitutions = [];
let total = 0;
for (const frame of manifest.frames) {
  const buffer = await readFile(path.join(folder, frame.file));
  if (buffer.subarray(1, 4).toString() !== 'PNG' || buffer.readUInt32BE(16) !== 1600 || buffer.readUInt32BE(20) !== 900) throw new Error(`Invalid PNG ${frame.file}`);
  const chunks = [];
  for (let offset = 8; offset < buffer.length;) {
    const size = buffer.readUInt32BE(offset);
    if (offset + size + 12 > buffer.length) throw new Error(`Truncated PNG ${frame.file}`);
    if (buffer.subarray(offset + 4, offset + 8).toString() === 'IDAT') chunks.push(buffer.subarray(offset + 8, offset + 8 + size));
    offset += size + 12;
  }
  inflateSync(Buffer.concat(chunks));
  const hash = createHash('sha256').update(buffer).digest('hex');
  if (hash !== frame.sha256) {
    const replacement = original.get(hash);
    if (!replacement) throw new Error(`Unidentified replacement ${frame.file}`);
    frame.replacement_source_index = replacement;
    substitutions.push({ frame: frame.index, source: replacement });
  }
  frame.sha256 = hash;
  frame.bytes = buffer.length;
  total += buffer.length;
}
manifest.total_png_bytes = total;
manifest.version = '1.1.0';
manifest.asset_note = '21 damaged source frames were previously replaced with nearby intact frames. replacement_source_index records those substitutions; originals are not reconstructed.';
await writeFile(path.join(folder, 'sequence.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ verified: manifest.frames.length, bytes: total, substitutions }, null, 2));
